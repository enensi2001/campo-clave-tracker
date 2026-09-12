import {
  ESTADOS_ACTIVOS,
  ESTADOS_COTIZACION_ABIERTA,
  ETAPAS_CERRADAS,
} from "./constants";
import { diasDesde, hoyISO } from "./format";
import type { Actividad, Contacto, Cotizacion, Empresa, Oportunidad, Visita } from "./data";

export type Semaforo = "ok" | "warn" | "danger" | "info" | "quote" | "idle";

export function semaforoFecha(fecha?: string | null): Semaforo {
  if (!fecha) return "danger";
  const hoy = hoyISO();
  if (fecha < hoy) return "danger";
  const d = diasDesde(fecha);
  if (d != null && d >= -3) return "warn";
  return "ok";
}

export function semaforoEstadoEmpresa(estado: string): Semaforo {
  if (estado === "Oportunidad activa") return "info";
  if (estado === "Cotización activa") return "quote";
  if (estado === "Prospecto dormido" || estado === "Descartada") return "idle";
  if (estado === "Cliente") return "ok";
  return "warn";
}

export const esEmpresaActiva = (e: Empresa) => ESTADOS_ACTIVOS.includes(e.estado_comercial);
export const esCotizacionAbierta = (c: Cotizacion) =>
  (ESTADOS_COTIZACION_ABIERTA as readonly string[]).includes(c.estado);
export const esOportunidadAbierta = (o: Oportunidad) =>
  !(ETAPAS_CERRADAS as readonly string[]).includes(o.etapa);

export function actividadVencida(a: Actividad) {
  return a.estado === "Pendiente" && a.fecha < hoyISO();
}
export function actividadHoy(a: Actividad) {
  return a.estado === "Pendiente" && a.fecha === hoyISO();
}

export const ORDEN_PRIORIDAD: Record<string, number> = { Alta: 0, Media: 1, Baja: 2 };

export type Datos = {
  empresas: Empresa[];
  contactos: Contacto[];
  visitas: Visita[];
  oportunidades: Oportunidad[];
  cotizaciones: Cotizacion[];
  actividades: Actividad[];
};

export type Atencion = {
  clave: string;
  titulo: string;
  detalle: string;
  ruta: { to: string; params?: Record<string, string> };
  nivel: Semaforo;
};

export function calcularAtencion(d: Datos): {
  activasSinAccion: Empresa[];
  visitadasSinContacto: Empresa[];
  cotizacionesVencidas: Cotizacion[];
  oportunidadesSinInteraccion: Oportunidad[];
} {
  const hoy = hoyISO();
  const pendientesPorEmpresa = new Set(
    d.actividades.filter((a) => a.estado === "Pendiente" && a.empresa_id).map((a) => a.empresa_id!),
  );
  const contactosPorEmpresa = new Set(d.contactos.map((c) => c.empresa_id));
  const empresasVisitadas = new Set(d.visitas.map((v) => v.empresa_id));

  const activasSinAccion = d.empresas.filter(
    (e) =>
      esEmpresaActiva(e) &&
      !pendientesPorEmpresa.has(e.id) &&
      !(e.fecha_proxima_accion && e.fecha_proxima_accion >= hoy),
  );

  const visitadasSinContacto = d.empresas.filter(
    (e) => empresasVisitadas.has(e.id) && !contactosPorEmpresa.has(e.id),
  );

  const cotizacionesVencidas = d.cotizaciones.filter(
    (c) =>
      esCotizacionAbierta(c) &&
      (!c.fecha_proximo_seguimiento || c.fecha_proximo_seguimiento < hoy),
  );

  const oportunidadesSinInteraccion = d.oportunidades.filter((o) => {
    if (!esOportunidadAbierta(o)) return false;
    const dias = diasDesde(o.ultima_interaccion ?? o.created_at.slice(0, 10));
    return dias != null && dias >= 7;
  });

  return {
    activasSinAccion,
    visitadasSinContacto,
    cotizacionesVencidas,
    oportunidadesSinInteraccion,
  };
}

export function calcularPipeline(d: Datos) {
  const abiertas = d.oportunidades.filter(esOportunidadAbierta);
  const valorAbierto = abiertas.reduce((s, o) => s + Number(o.valor_estimado ?? 0), 0);
  const ponderado = abiertas.reduce(
    (s, o) => s + (Number(o.valor_estimado ?? 0) * Number(o.probabilidad ?? 0)) / 100,
    0,
  );
  const cotizacionesAbiertas = d.cotizaciones.filter(esCotizacionAbierta);
  return {
    oportunidadesActivas: abiertas.length,
    valorAbierto,
    ponderado,
    cotizacionesAbiertas: cotizacionesAbiertas.length,
    importeCotizado: cotizacionesAbiertas.reduce((s, c) => s + Number(c.importe ?? 0), 0),
  };
}

export function rangoDesde(periodo: "semana" | "mes" | "trimestre" | "anio"): string {
  const dias = { semana: 7, mes: 30, trimestre: 90, anio: 365 }[periodo];
  const hoy = new Date(`${hoyISO()}T00:00:00Z`);
  hoy.setUTCDate(hoy.getUTCDate() - dias);
  return hoy.toISOString().slice(0, 10);
}

export function calcularActividadPeriodo(d: Datos, desde: string) {
  const enRango = (iso?: string | null) => !!iso && iso.slice(0, 10) >= desde;

  const visitas = d.visitas.filter((v) => enRango(v.fecha));
  const empresasVisitadas = new Set(visitas.map((v) => v.empresa_id)).size;
  const cotizacionesEnviadas = d.cotizaciones.filter(
    (c) => enRango(c.fecha) && c.estado !== "Preparación",
  );
  const ganadas = d.oportunidades.filter(
    (o) => o.etapa === "Ganada" && enRango(o.updated_at.slice(0, 10)),
  );

  return {
    empresasNuevas: d.empresas.filter((e) => enRango(e.created_at)).length,
    empresasVisitadas,
    visitas: visitas.length,
    contactosObtenidos: d.contactos.filter((c) => enRango(c.created_at)).length,
    oportunidadesCreadas: d.oportunidades.filter((o) => enRango(o.created_at)).length,
    cotizacionesEnviadas: cotizacionesEnviadas.length,
    actividadesCompletadas: d.actividades.filter(
      (a) => a.estado === "Completada" && enRango(a.fecha),
    ).length,
    ventasGanadas: ganadas.length,
    valorGanado: ganadas.reduce((s, o) => s + Number(o.valor_estimado ?? 0), 0),
    valorPerdido: d.oportunidades
      .filter((o) => o.etapa === "Perdida" && enRango(o.updated_at.slice(0, 10)))
      .reduce((s, o) => s + Number(o.valor_estimado ?? 0), 0),
    pipelineGenerado: d.oportunidades
      .filter((o) => enRango(o.created_at))
      .reduce((s, o) => s + Number(o.valor_estimado ?? 0), 0),
  };
}

export function calcularPipelineConstruccion(d: Datos) {
  const conOportunidad = new Set(d.oportunidades.map((o) => o.empresa_id));
  const visitadas = new Set(d.visitas.map((v) => v.empresa_id));
  const desdeMes = rangoDesde("mes");
  const contactosPorEmpresa = new Set(d.contactos.map((c) => c.empresa_id));

  return {
    visitadasSinOportunidad: [...visitadas].filter((id) => !conOportunidad.has(id)).length,
    conContactoIdentificado: contactosPorEmpresa.size,
    conSeguimientoActivo: new Set(
      d.actividades.filter((a) => a.estado === "Pendiente" && a.empresa_id).map((a) => a.empresa_id),
    ).size,
    visitasMes: d.visitas.filter((v) => v.fecha >= desdeMes).length,
    contactosMes: d.contactos.filter((c) => c.created_at.slice(0, 10) >= desdeMes).length,
  };
}

/** Prioridad de hoy: reglas simples y determinísticas. */
export function prioridadDeHoy(d: Datos): Atencion[] {
  const items: Atencion[] = [];
  const hoy = hoyISO();
  const empresaNombre = (id?: string | null) =>
    d.empresas.find((e) => e.id === id)?.nombre ?? "Sin empresa";

  for (const a of d.actividades.filter(actividadVencida)) {
    items.push({
      clave: `act-${a.id}`,
      titulo: `${a.tipo} — ${empresaNombre(a.empresa_id)}`,
      detalle: `Actividad vencida desde ${a.fecha.slice(8, 10)}/${a.fecha.slice(5, 7)}`,
      ruta: { to: "/actividades" },
      nivel: "danger",
    });
  }

  for (const c of d.cotizaciones.filter(
    (c) => esCotizacionAbierta(c) && (!c.fecha_proximo_seguimiento || c.fecha_proximo_seguimiento <= hoy),
  )) {
    items.push({
      clave: `cot-${c.id}`,
      titulo: `Cotización ${c.folio} — ${empresaNombre(c.empresa_id)}`,
      detalle: "Requiere seguimiento",
      ruta: { to: "/cotizaciones" },
      nivel: "danger",
    });
  }

  for (const o of d.oportunidades.filter(esOportunidadAbierta)) {
    const dias = diasDesde(o.ultima_interaccion ?? o.created_at.slice(0, 10)) ?? 0;
    if (dias >= 7 && Number(o.valor_estimado ?? 0) >= 200000) {
      items.push({
        clave: `opo-${o.id}`,
        titulo: `${o.nombre_proyecto} — ${empresaNombre(o.empresa_id)}`,
        detalle: `Oportunidad de alto valor, ${dias} días sin interacción`,
        ruta: { to: "/pipeline" },
        nivel: "danger",
      });
    }
  }

  for (const a of d.actividades.filter(actividadHoy)) {
    items.push({
      clave: `hoy-${a.id}`,
      titulo: `${a.tipo} — ${empresaNombre(a.empresa_id)}`,
      detalle: a.objetivo ?? "Actividad de hoy",
      ruta: { to: "/actividades" },
      nivel: a.prioridad === "Alta" ? "danger" : "warn",
    });
  }

  const { visitadasSinContacto } = calcularAtencion(d);
  for (const e of visitadasSinContacto) {
    items.push({
      clave: `sc-${e.id}`,
      titulo: e.nombre,
      detalle: "Empresa visitada sin contacto",
      ruta: { to: "/empresas/$id", params: { id: e.id } },
      nivel: "warn",
    });
  }

  return items.slice(0, 12);
}

export type EventoHistorial = {
  id: string;
  fecha: string;
  tipo: string;
  titulo: string;
  detalle?: string | null;
  nivel: Semaforo;
};

export function historialEmpresa(d: Datos, empresaId: string): EventoHistorial[] {
  const eventos: EventoHistorial[] = [];

  for (const v of d.visitas.filter((x) => x.empresa_id === empresaId)) {
    eventos.push({
      id: `v-${v.id}`,
      fecha: v.fecha,
      tipo: v.tipo_visita,
      titulo: v.resultado,
      detalle: [v.informacion_obtenida, v.material_entregado, v.notas].filter(Boolean).join(" · "),
      nivel: "warn",
    });
  }
  for (const c of d.contactos.filter((x) => x.empresa_id === empresaId)) {
    eventos.push({
      id: `c-${c.id}`,
      fecha: c.created_at.slice(0, 10),
      tipo: "Contacto",
      titulo: `Contacto registrado: ${c.nombre} ${c.apellidos ?? ""}`.trim(),
      detalle: [c.area, c.puesto].filter(Boolean).join(" · "),
      nivel: "info",
    });
  }
  for (const o of d.oportunidades.filter((x) => x.empresa_id === empresaId)) {
    eventos.push({
      id: `o-${o.id}`,
      fecha: o.created_at.slice(0, 10),
      tipo: "Oportunidad",
      titulo: o.nombre_proyecto,
      detalle: `Etapa: ${o.etapa}`,
      nivel: "info",
    });
    if (o.etapa === "Perdida") {
      eventos.push({
        id: `op-${o.id}`,
        fecha: o.fecha_perdida ?? o.updated_at.slice(0, 10),
        tipo: "Oportunidad perdida",
        titulo: `Oportunidad perdida: ${o.nombre_proyecto}`,
        detalle: [
          o.motivo_perdida ? `Motivo: ${o.motivo_perdida}` : null,
          o.competidor_ganador ? `Ganó: ${o.competidor_ganador}` : null,
          o.nota_perdida,
        ]
          .filter(Boolean)
          .join(" · "),
        nivel: "danger",
      });
    }
  }
  for (const c of d.cotizaciones.filter((x) => x.empresa_id === empresaId)) {
    eventos.push({
      id: `q-${c.id}`,
      fecha: c.fecha,
      tipo: "Cotización",
      titulo: `${c.folio} — ${c.estado}`,
      detalle: c.descripcion,
      nivel: "quote",
    });
  }
  for (const a of d.actividades.filter(
    (x) => x.empresa_id === empresaId && x.estado === "Completada",
  )) {
    eventos.push({
      id: `a-${a.id}`,
      fecha: a.fecha,
      tipo: a.tipo,
      titulo: a.resultado ?? a.objetivo ?? "Actividad completada",
      detalle: a.notas,
      nivel: "ok",
    });
  }

  return eventos.sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
}

export function ultimaVisita(d: Datos, empresaId: string): Visita | undefined {
  return d.visitas
    .filter((v) => v.empresa_id === empresaId)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
}

export function contactoPrincipal(d: Datos, empresaId: string): Contacto | undefined {
  const lista = d.contactos.filter((c) => c.empresa_id === empresaId);
  return (
    lista.find((c) => c.nivel_contacto?.startsWith("A")) ??
    lista.find((c) => c.nivel_contacto?.startsWith("B")) ??
    lista[0]
  );
}

export function posiblesDuplicados(
  empresas: Empresa[],
  candidato: { nombre: string; telefono_general?: string | null; sitio_web?: string | null },
  excluirId?: string,
): Empresa[] {
  const nombre = candidato.nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
  const tel = (candidato.telefono_general ?? "").replace(/\D/g, "");
  const web = (candidato.sitio_web ?? "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");

  return empresas.filter((e) => {
    if (e.id === excluirId) return false;
    const n = e.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    if (nombre.length > 3 && (n.includes(nombre) || nombre.includes(n))) return true;
    const t = (e.telefono_general ?? "").replace(/\D/g, "");
    if (tel.length >= 8 && t === tel) return true;
    const w = (e.sitio_web ?? "")
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");
    if (web.length > 3 && w === web) return true;
    return false;
  });
}

export type Dependencia = { etiqueta: string; cantidad: number; enCascada: boolean };

/** Registros relacionados que se verán afectados al eliminar. */
export function dependencias(
  d: Datos,
  tabla: "empresas" | "contactos" | "visitas" | "oportunidades" | "cotizaciones" | "actividades",
  id: string,
): Dependencia[] {
  const filtrar = <T extends Record<string, unknown>>(lista: T[], clave: string) =>
    lista.filter((x) => x[clave] === id).length;

  if (tabla === "empresas") {
    return [
      { etiqueta: "contactos", cantidad: filtrar(d.contactos, "empresa_id"), enCascada: true },
      { etiqueta: "visitas", cantidad: filtrar(d.visitas, "empresa_id"), enCascada: true },
      {
        etiqueta: "oportunidades",
        cantidad: filtrar(d.oportunidades, "empresa_id"),
        enCascada: true,
      },
      {
        etiqueta: "cotizaciones",
        cantidad: filtrar(d.cotizaciones, "empresa_id"),
        enCascada: true,
      },
      { etiqueta: "actividades", cantidad: filtrar(d.actividades, "empresa_id"), enCascada: true },
    ].filter((x) => x.cantidad > 0);
  }

  if (tabla === "contactos") {
    return [
      { etiqueta: "visitas", cantidad: filtrar(d.visitas, "contacto_id"), enCascada: false },
      {
        etiqueta: "oportunidades",
        cantidad: filtrar(d.oportunidades, "contacto_id"),
        enCascada: false,
      },
      {
        etiqueta: "cotizaciones",
        cantidad: filtrar(d.cotizaciones, "contacto_id"),
        enCascada: false,
      },
      { etiqueta: "actividades", cantidad: filtrar(d.actividades, "contacto_id"), enCascada: false },
    ].filter((x) => x.cantidad > 0);
  }

  if (tabla === "oportunidades") {
    return [
      {
        etiqueta: "cotizaciones",
        cantidad: filtrar(d.cotizaciones, "oportunidad_id"),
        enCascada: false,
      },
      {
        etiqueta: "actividades",
        cantidad: filtrar(d.actividades, "oportunidad_id"),
        enCascada: false,
      },
    ].filter((x) => x.cantidad > 0);
  }

  if (tabla === "cotizaciones") {
    return [
      {
        etiqueta: "actividades",
        cantidad: filtrar(d.actividades, "cotizacion_id"),
        enCascada: false,
      },
    ].filter((x) => x.cantidad > 0);
  }

  return [];
}

import { fechaCorta, hoyISO, sumarDias } from "./format";
import type { Datos } from "./logic";

export type Rango = { desde: string; hasta: string };

/** Lunes de la semana que contiene la fecha dada (zona America/Mexico_City). */
export function lunesDe(iso: string): string {
  const dia = new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 = domingo
  const resta = dia === 0 ? 6 : dia - 1;
  return sumarDias(iso, -resta);
}

function primerDiaMes(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

function ultimoDiaMes(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const base = new Date(Date.UTC(y ?? 2000, m ?? 1, 1));
  base.setUTCDate(base.getUTCDate() - 1);
  return base.toISOString().slice(0, 10);
}

export type ClaveAtajo =
  | "semana"
  | "semana_anterior"
  | "ultimos7"
  | "ultimos20"
  | "mes"
  | "mes_anterior"
  | "personalizado";

export const ATAJOS: { valor: ClaveAtajo; etiqueta: string }[] = [
  { valor: "semana", etiqueta: "Esta semana" },
  { valor: "semana_anterior", etiqueta: "Semana anterior" },
  { valor: "ultimos7", etiqueta: "Últimos 7 días" },
  { valor: "ultimos20", etiqueta: "Últimos 20 días" },
  { valor: "mes", etiqueta: "Este mes" },
  { valor: "mes_anterior", etiqueta: "Mes anterior" },
  { valor: "personalizado", etiqueta: "Personalizado" },
];

export function rangoDeAtajo(clave: ClaveAtajo, actual?: Rango): Rango {
  const hoy = hoyISO();
  const lunes = lunesDe(hoy);
  switch (clave) {
    case "semana":
      return { desde: lunes, hasta: hoy };
    case "semana_anterior":
      return { desde: sumarDias(lunes, -7), hasta: sumarDias(lunes, -1) };
    case "ultimos7":
      return { desde: sumarDias(hoy, -6), hasta: hoy };
    case "ultimos20":
      return { desde: sumarDias(hoy, -19), hasta: hoy };
    case "mes":
      return { desde: primerDiaMes(hoy), hasta: hoy };
    case "mes_anterior": {
      const finAnterior = sumarDias(primerDiaMes(hoy), -1);
      return { desde: primerDiaMes(finAnterior), hasta: ultimoDiaMes(finAnterior) };
    }
    default:
      return actual ?? { desde: lunes, hasta: hoy };
  }
}

const VACIO = "—";
const val = (v: unknown) => {
  if (v == null || v === "") return VACIO;
  return v;
};
const fecha = (v?: string | null) => (v ? fechaCorta(v) : VACIO);
const monto = (v?: number | string | null) => (v == null ? 0 : Number(v));

function enRango(iso: string | null | undefined, r: Rango): boolean {
  if (!iso) return false;
  const d = iso.slice(0, 10);
  return d >= r.desde && d <= r.hasta;
}

type Hoja = { nombre: string; encabezados: string[]; filas: unknown[][] };

export function construirHojas(d: Datos, rango: Rango): Hoja[] {
  const nombreEmpresa = (id?: string | null) =>
    val(d.empresas.find((e) => e.id === id)?.nombre);
  const nombreContacto = (id?: string | null) => {
    const c = d.contactos.find((x) => x.id === id);
    return c ? `${c.nombre} ${c.apellidos ?? ""}`.trim() : VACIO;
  };
  const nombreOportunidad = (id?: string | null) =>
    val(d.oportunidades.find((o) => o.id === id)?.nombre_proyecto);
  const folioCotizacion = (id?: string | null) =>
    val(d.cotizaciones.find((c) => c.id === id)?.folio);

  const empresas = d.empresas.filter((e) => enRango(e.created_at, rango));
  const contactos = d.contactos.filter((c) => enRango(c.created_at, rango));
  const visitas = d.visitas.filter((v) => enRango(v.fecha, rango));
  const actividades = d.actividades.filter((a) => enRango(a.fecha, rango));
  const oportunidades = d.oportunidades.filter((o) => enRango(o.created_at, rango));
  const cotizaciones = d.cotizaciones.filter((c) => enRango(c.fecha, rango));

  const importePorMoneda = (lista: typeof cotizaciones, moneda: string) =>
    lista.filter((c) => c.moneda === moneda).reduce((s, c) => s + monto(c.importe), 0);

  const ganadas = oportunidades.filter((o) => o.etapa === "Ganada");
  const perdidas = d.oportunidades.filter(
    (o) => o.etapa === "Perdida" && enRango(o.fecha_perdida ?? o.updated_at, rango),
  );

  const resumen: Hoja = {
    nombre: "Resumen",
    encabezados: ["Indicador", "Valor"],
    filas: [
      ["Periodo", `${fechaCorta(rango.desde)} a ${fechaCorta(rango.hasta)}`],
      ["Empresas registradas", empresas.length],
      ["Empresas visitadas", new Set(visitas.map((v) => v.empresa_id)).size],
      ["Visitas realizadas", visitas.length],
      ["Contactos creados", contactos.length],
      ["Actividades del periodo", actividades.length],
      ["Actividades completadas", actividades.filter((a) => a.estado === "Completada").length],
      ["Actividades pendientes", actividades.filter((a) => a.estado === "Pendiente").length],
      ["Oportunidades creadas", oportunidades.length],
      ["Cotizaciones emitidas", cotizaciones.length],
      ["Importe cotizado (MXN)", importePorMoneda(cotizaciones, "MXN")],
      ["Importe cotizado (USD)", importePorMoneda(cotizaciones, "USD")],
      ["Oportunidades ganadas", ganadas.length],
      ["Valor ganado", ganadas.reduce((s, o) => s + monto(o.valor_estimado), 0)],
      ["Oportunidades perdidas", perdidas.length],
      ["Valor perdido", perdidas.reduce((s, o) => s + monto(o.valor_estimado), 0)],
    ],
  };

  return [
    resumen,
    {
      nombre: "Empresas",
      encabezados: [
        "Empresa",
        "Nombre comercial",
        "Industria",
        "Estado comercial",
        "Origen",
        "Ciudad",
        "Estado",
        "Parque industrial",
        "Dirección",
        "Latitud",
        "Longitud",
        "Teléfono",
        "Sitio web",
        "Última interacción",
        "Próxima acción",
        "Fecha próxima acción",
        "Notas",
        "Registrada",
      ],
      filas: empresas.map((e) => [
        e.nombre,
        val(e.nombre_comercial),
        val(e.industria),
        e.estado_comercial,
        e.origen,
        val(e.ciudad),
        val(e.estado),
        val(e.parque_industrial),
        val(e.direccion),
        val(e.latitud),
        val(e.longitud),
        val(e.telefono_general),
        val(e.sitio_web),
        fecha(e.ultima_interaccion),
        val(e.proxima_accion),
        fecha(e.fecha_proxima_accion),
        val(e.notas),
        fecha(e.created_at),
      ]),
    },
    {
      nombre: "Contactos",
      encabezados: [
        "Contacto",
        "Empresa",
        "Área",
        "Puesto",
        "Nivel de contacto",
        "Teléfono",
        "Extensión",
        "WhatsApp",
        "Correo",
        "LinkedIn",
        "Notas",
        "Registrado",
      ],
      filas: contactos.map((c) => [
        `${c.nombre} ${c.apellidos ?? ""}`.trim(),
        nombreEmpresa(c.empresa_id),
        val(c.area),
        val(c.puesto),
        val(c.nivel_contacto),
        val(c.telefono),
        val(c.extension),
        val(c.whatsapp),
        val(c.correo),
        val(c.linkedin),
        val(c.notas),
        fecha(c.created_at),
      ]),
    },
    {
      nombre: "Visitas",
      encabezados: [
        "Fecha",
        "Hora",
        "Empresa",
        "Contacto",
        "Tipo de visita",
        "Resultado",
        "Información obtenida",
        "Material entregado",
        "Latitud",
        "Longitud",
        "Próxima acción",
        "Fecha próxima acción",
        "Notas",
      ],
      filas: visitas.map((v) => [
        fecha(v.fecha),
        val(v.hora?.slice(0, 5)),
        nombreEmpresa(v.empresa_id),
        nombreContacto(v.contacto_id),
        v.tipo_visita,
        v.resultado,
        val(v.informacion_obtenida),
        val(v.material_entregado),
        val(v.latitud),
        val(v.longitud),
        val(v.proxima_accion),
        fecha(v.fecha_proxima_accion),
        val(v.notas),
      ]),
    },
    {
      nombre: "Actividades",
      encabezados: [
        "Fecha",
        "Hora",
        "Tipo",
        "Estado",
        "Prioridad",
        "Empresa",
        "Contacto",
        "Oportunidad",
        "Cotización",
        "Objetivo",
        "Resultado",
        "Notas",
        "Creada",
      ],
      filas: actividades.map((a) => [
        fecha(a.fecha),
        val(a.hora?.slice(0, 5)),
        a.tipo,
        a.estado,
        a.prioridad,
        nombreEmpresa(a.empresa_id),
        nombreContacto(a.contacto_id),
        nombreOportunidad(a.oportunidad_id),
        folioCotizacion(a.cotizacion_id),
        val(a.objetivo),
        val(a.resultado),
        val(a.notas),
        fecha(a.created_at),
      ]),
    },
    {
      nombre: "Oportunidades",
      encabezados: [
        "Proyecto",
        "Empresa",
        "Contacto",
        "Etapa",
        "Valor estimado",
        "Moneda",
        "Probabilidad (%)",
        "Cierre estimado",
        "Necesidad",
        "Problema detectado",
        "Solución propuesta",
        "Competencia",
        "Motivo de pérdida",
        "Nota de pérdida",
        "Competidor ganador",
        "Fecha de pérdida",
        "Última interacción",
        "Próxima acción",
        "Fecha próxima acción",
        "Notas",
        "Creada",
      ],
      filas: oportunidades.map((o) => [
        o.nombre_proyecto,
        nombreEmpresa(o.empresa_id),
        nombreContacto(o.contacto_id),
        o.etapa,
        monto(o.valor_estimado),
        o.moneda,
        Number(o.probabilidad ?? 0),
        fecha(o.fecha_estimada_cierre),
        val(o.necesidad),
        val(o.problema_detectado),
        val(o.solucion_propuesta),
        val(o.competencia),
        val(o.motivo_perdida),
        val(o.nota_perdida),
        val(o.competidor_ganador),
        fecha(o.fecha_perdida),
        fecha(o.ultima_interaccion),
        val(o.proxima_accion),
        fecha(o.fecha_proxima_accion),
        val(o.notas),
        fecha(o.created_at),
      ]),
    },
    {
      nombre: "Cotizaciones",
      encabezados: [
        "Folio",
        "Fecha",
        "Empresa",
        "Contacto",
        "Oportunidad",
        "Estado",
        "Importe",
        "Moneda",
        "Descripción",
        "Vigencia",
        "Tiempo de entrega",
        "Último seguimiento",
        "Próximo seguimiento",
        "Notas",
        "Creada",
      ],
      filas: cotizaciones.map((c) => [
        c.folio,
        fecha(c.fecha),
        nombreEmpresa(c.empresa_id),
        nombreContacto(c.contacto_id),
        nombreOportunidad(c.oportunidad_id),
        c.estado,
        monto(c.importe),
        c.moneda,
        val(c.descripcion),
        fecha(c.vigencia),
        val(c.tiempo_entrega),
        fecha(c.fecha_ultimo_seguimiento),
        fecha(c.fecha_proximo_seguimiento),
        val(c.notas),
        fecha(c.created_at),
      ]),
    },
  ];
}

function anchos(hoja: Hoja): { wch: number }[] {
  return hoja.encabezados.map((h, i) => {
    const largos = hoja.filas.map((f) => String(f[i] ?? "").length);
    const max = Math.max(h.length, ...(largos.length ? largos : [0]));
    return { wch: Math.min(Math.max(max + 2, 10), 44) };
  });
}

/** Genera y descarga el libro de Excel. Devuelve el total de filas de datos. */
export async function generarExcel(d: Datos, rango: Rango): Promise<number> {
  const XLSX = await import("xlsx");
  const hojas = construirHojas(d, rango);
  const libro = XLSX.utils.book_new();

  for (const hoja of hojas) {
    const ws = XLSX.utils.aoa_to_sheet([hoja.encabezados, ...hoja.filas]);
    ws["!cols"] = anchos(hoja);
    const ultimaCol = XLSX.utils.encode_col(hoja.encabezados.length - 1);
    ws["!autofilter"] = { ref: `A1:${ultimaCol}${hoja.filas.length + 1}` };
    (ws as Record<string, unknown>)["!freeze"] = "A2";
    XLSX.utils.book_append_sheet(libro, ws, hoja.nombre);
  }

  const buffer = XLSX.write(libro, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `Campo_Activo_${rango.desde}_a_${rango.hasta}.xlsx`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  return hojas.slice(1).reduce((s, h) => s + h.filas.length, 0);
}

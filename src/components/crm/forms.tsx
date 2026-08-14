import { useMemo, useState } from "react";
import { LocateFixed, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Campo, Chip, Selector } from "@/components/crm/ui-bits";
import {
  AREAS,
  ESTADOS_ACTIVIDAD,
  ESTADOS_COMERCIALES,
  ESTADOS_COTIZACION,
  ETAPAS_OPORTUNIDAD,
  MONEDAS,
  NIVELES_CONTACTO,
  ORIGENES,
  PRIORIDADES,
  RESULTADOS_VISITA,
  SUGERENCIAS_POR_RESULTADO,
  TIPOS_ACTIVIDAD,
  TIPOS_VISITA,
} from "@/lib/crm/constants";
import {
  actualizarRegistro,
  crearRegistro,
  useCrm,
  useInvalidarCrm,
  type Actividad,
  type Contacto,
  type Cotizacion,
  type Empresa,
  type Oportunidad,
  type Visita,
} from "@/lib/crm/data";
import { hoyISO, horaActual, sumarDias } from "@/lib/crm/format";
import { posiblesDuplicados } from "@/lib/crm/logic";

type Valores = Record<string, unknown>;

function useFormulario<T extends Valores>(inicial: T) {
  const [valores, setValores] = useState<T>(inicial);
  const set = <K extends keyof T>(clave: K, valor: T[K]) =>
    setValores((prev) => ({ ...prev, [clave]: valor }));
  return { valores, set, setValores };
}

const texto = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && String(v).trim() !== "" ? n : null;
};

function Acciones({
  guardando,
  onCancelar,
  etiqueta = "Guardar",
}: {
  guardando: boolean;
  onCancelar: () => void;
  etiqueta?: string;
}) {
  return (
    <div className="sticky bottom-0 -mx-1 flex gap-2 bg-background/95 pt-3">
      <Button type="button" variant="outline" className="h-11 flex-1" onClick={onCancelar}>
        Cancelar
      </Button>
      <Button type="submit" className="h-11 flex-[2]" disabled={guardando}>
        {guardando ? <Loader2 className="size-4 animate-spin" /> : null}
        {etiqueta}
      </Button>
    </div>
  );
}

function useUbicacion(aplicar: (lat: number, lng: number) => void) {
  const [cargando, setCargando] = useState(false);
  const obtener = () => {
    if (!navigator.geolocation) {
      toast.error("Este dispositivo no permite geolocalización");
      return;
    }
    setCargando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        aplicar(
          Number(pos.coords.latitude.toFixed(6)),
          Number(pos.coords.longitude.toFixed(6)),
        );
        setCargando(false);
        toast.success("Ubicación capturada");
      },
      () => {
        setCargando(false);
        toast.error("No se pudo obtener la ubicación");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  return { obtener, cargando };
}

function BotonUbicacion({ onListo }: { onListo: (lat: number, lng: number) => void }) {
  const { obtener, cargando } = useUbicacion(onListo);
  return (
    <Button type="button" variant="secondary" className="h-11 w-full" onClick={obtener}>
      {cargando ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LocateFixed className="size-4" />
      )}
      Obtener ubicación actual
    </Button>
  );
}

/** Marca la empresa como tocada y opcionalmente actualiza su próxima acción y estado. */
async function tocarEmpresa(
  empresaId: string,
  cambios: Valores & { estado_comercial?: string | null },
) {
  await actualizarRegistro("empresas", empresaId, {
    ultima_interaccion: hoyISO(),
    ...cambios,
  });
}

// ---------------------------------------------------------------- EMPRESA

export function FormEmpresa({
  registro,
  onListo,
  onCancelar,
}: {
  registro?: Empresa | null;
  onListo: (id: string) => void;
  onCancelar: () => void;
}) {
  const { empresas } = useCrm();
  const invalidar = useInvalidarCrm();
  const [guardando, setGuardando] = useState(false);
  const { valores, set } = useFormulario({
    nombre: registro?.nombre ?? "",
    nombre_comercial: registro?.nombre_comercial ?? "",
    industria: registro?.industria ?? "",
    direccion: registro?.direccion ?? "",
    ciudad: registro?.ciudad ?? "",
    estado: registro?.estado ?? "",
    parque_industrial: registro?.parque_industrial ?? "",
    latitud: registro?.latitud != null ? String(registro.latitud) : "",
    longitud: registro?.longitud != null ? String(registro.longitud) : "",
    sitio_web: registro?.sitio_web ?? "",
    telefono_general: registro?.telefono_general ?? "",
    origen: registro?.origen ?? "Recorrido físico",
    estado_comercial: registro?.estado_comercial ?? "Pendiente de visitar",
    notas: registro?.notas ?? "",
    proxima_accion: registro?.proxima_accion ?? "",
    fecha_proxima_accion: registro?.fecha_proxima_accion ?? "",
  });

  const duplicados = useMemo(
    () =>
      valores.nombre.trim().length > 3
        ? posiblesDuplicados(
            empresas,
            {
              nombre: valores.nombre,
              telefono_general: valores.telefono_general,
              sitio_web: valores.sitio_web,
            },
            registro?.id,
          )
        : [],
    [empresas, valores.nombre, valores.telefono_general, valores.sitio_web, registro?.id],
  );

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valores.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        nombre: valores.nombre.trim(),
        nombre_comercial: texto(valores.nombre_comercial),
        industria: texto(valores.industria),
        direccion: texto(valores.direccion),
        ciudad: texto(valores.ciudad),
        estado: texto(valores.estado),
        parque_industrial: texto(valores.parque_industrial),
        latitud: num(valores.latitud),
        longitud: num(valores.longitud),
        sitio_web: texto(valores.sitio_web),
        telefono_general: texto(valores.telefono_general),
        origen: valores.origen,
        estado_comercial: valores.estado_comercial,
        notas: texto(valores.notas),
        proxima_accion: texto(valores.proxima_accion),
        fecha_proxima_accion: texto(valores.fecha_proxima_accion),
      };
      let id = registro?.id;
      if (id) await actualizarRegistro("empresas", id, payload);
      else id = (await crearRegistro("empresas", payload)).id;
      invalidar();
      toast.success(registro ? "Empresa actualizada" : "Empresa registrada");
      onListo(id);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo label="Nombre *">
        <Input
          className="h-11"
          value={valores.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          placeholder="Razón social"
          required
        />
      </Campo>

      {duplicados.length > 0 && !registro ? (
        <div className="rounded-lg border border-warn-foreground/30 bg-warn p-3 text-warn-foreground">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <AlertTriangle className="size-4" /> Esta empresa podría estar registrada.
          </p>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {duplicados.slice(0, 3).map((d) => (
              <li key={d.id}>
                {d.nombre} — {d.ciudad ?? "Sin ciudad"} ({d.estado_comercial})
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs">Puedes revisarla en Empresas o continuar el registro.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Nombre comercial">
          <Input
            className="h-11"
            value={valores.nombre_comercial}
            onChange={(e) => set("nombre_comercial", e.target.value)}
          />
        </Campo>
        <Campo label="Industria">
          <Input
            className="h-11"
            value={valores.industria}
            onChange={(e) => set("industria", e.target.value)}
          />
        </Campo>
        <Campo label="Ciudad">
          <Input
            className="h-11"
            value={valores.ciudad}
            onChange={(e) => set("ciudad", e.target.value)}
          />
        </Campo>
        <Campo label="Estado">
          <Input
            className="h-11"
            value={valores.estado}
            onChange={(e) => set("estado", e.target.value)}
          />
        </Campo>
      </div>

      <Campo label="Dirección">
        <Input
          className="h-11"
          value={valores.direccion}
          onChange={(e) => set("direccion", e.target.value)}
        />
      </Campo>
      <Campo label="Parque industrial">
        <Input
          className="h-11"
          value={valores.parque_industrial}
          onChange={(e) => set("parque_industrial", e.target.value)}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Teléfono">
          <Input
            className="h-11"
            inputMode="tel"
            value={valores.telefono_general}
            onChange={(e) => set("telefono_general", e.target.value)}
          />
        </Campo>
        <Campo label="Sitio web">
          <Input
            className="h-11"
            value={valores.sitio_web}
            onChange={(e) => set("sitio_web", e.target.value)}
          />
        </Campo>
        <Campo label="Origen">
          <Selector
            valor={valores.origen}
            onChange={(v) => set("origen", v ?? "Otro")}
            opciones={ORIGENES}
          />
        </Campo>
        <Campo label="Estado comercial">
          <Selector
            valor={valores.estado_comercial}
            onChange={(v) => set("estado_comercial", v ?? "Pendiente de visitar")}
            opciones={ESTADOS_COMERCIALES}
          />
        </Campo>
        <Campo label="Latitud">
          <Input
            className="h-11"
            value={valores.latitud}
            onChange={(e) => set("latitud", e.target.value)}
          />
        </Campo>
        <Campo label="Longitud">
          <Input
            className="h-11"
            value={valores.longitud}
            onChange={(e) => set("longitud", e.target.value)}
          />
        </Campo>
      </div>

      <BotonUbicacion
        onListo={(lat, lng) => {
          set("latitud", String(lat));
          set("longitud", String(lng));
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Próxima acción">
          <Input
            className="h-11"
            value={valores.proxima_accion}
            onChange={(e) => set("proxima_accion", e.target.value)}
          />
        </Campo>
        <Campo label="Fecha">
          <Input
            className="h-11"
            type="date"
            value={valores.fecha_proxima_accion}
            onChange={(e) => set("fecha_proxima_accion", e.target.value)}
          />
        </Campo>
      </div>

      <Campo label="Notas">
        <Textarea
          value={valores.notas}
          onChange={(e) => set("notas", e.target.value)}
          rows={3}
        />
      </Campo>

      <Acciones guardando={guardando} onCancelar={onCancelar} />
    </form>
  );
}

// --------------------------------------------------------------- CONTACTO

function SelectorEmpresa({
  valor,
  onChange,
  empresas,
}: {
  valor: string | null;
  onChange: (v: string | null) => void;
  empresas: Empresa[];
}) {
  return (
    <Selector
      valor={valor}
      onChange={onChange}
      placeholder="Selecciona empresa"
      opciones={empresas.map((e) => ({ valor: e.id, etiqueta: e.nombre }))}
    />
  );
}

export function FormContacto({
  registro,
  empresaId,
  onListo,
  onCancelar,
}: {
  registro?: Contacto | null;
  empresaId?: string | null;
  onListo: (id: string) => void;
  onCancelar: () => void;
}) {
  const { empresas } = useCrm();
  const invalidar = useInvalidarCrm();
  const [guardando, setGuardando] = useState(false);
  const { valores, set } = useFormulario({
    empresa_id: registro?.empresa_id ?? empresaId ?? null,
    nombre: registro?.nombre ?? "",
    apellidos: registro?.apellidos ?? "",
    area: registro?.area ?? null,
    puesto: registro?.puesto ?? "",
    telefono: registro?.telefono ?? "",
    whatsapp: registro?.whatsapp ?? "",
    correo: registro?.correo ?? "",
    linkedin: registro?.linkedin ?? "",
    extension: registro?.extension ?? "",
    nivel_contacto: registro?.nivel_contacto ?? null,
    notas: registro?.notas ?? "",
  });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valores.empresa_id) {
      toast.error("Selecciona la empresa");
      return;
    }
    if (!valores.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        empresa_id: valores.empresa_id,
        nombre: valores.nombre.trim(),
        apellidos: texto(valores.apellidos),
        area: valores.area,
        puesto: texto(valores.puesto),
        telefono: texto(valores.telefono),
        whatsapp: texto(valores.whatsapp),
        correo: texto(valores.correo),
        linkedin: texto(valores.linkedin),
        extension: texto(valores.extension),
        nivel_contacto: valores.nivel_contacto,
        notas: texto(valores.notas),
      };
      let id = registro?.id;
      if (id) await actualizarRegistro("contactos", id, payload);
      else {
        id = (await crearRegistro("contactos", payload)).id;
        const empresa = empresas.find((x) => x.id === valores.empresa_id);
        if (
          empresa &&
          ["Pendiente de visitar", "Visitada sin contacto"].includes(empresa.estado_comercial)
        ) {
          await tocarEmpresa(empresa.id, { estado_comercial: "Contacto identificado" });
        }
      }
      invalidar();
      toast.success("Contacto guardado");
      onListo(id);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo label="Empresa *">
        <SelectorEmpresa
          valor={valores.empresa_id}
          onChange={(v) => set("empresa_id", v)}
          empresas={empresas}
        />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Nombre *">
          <Input
            className="h-11"
            value={valores.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            required
          />
        </Campo>
        <Campo label="Apellidos">
          <Input
            className="h-11"
            value={valores.apellidos}
            onChange={(e) => set("apellidos", e.target.value)}
          />
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Área">
          <Selector
            valor={valores.area}
            onChange={(v) => set("area", v)}
            opciones={AREAS}
            permitirVacio
          />
        </Campo>
        <Campo label="Puesto">
          <Input
            className="h-11"
            value={valores.puesto}
            onChange={(e) => set("puesto", e.target.value)}
          />
        </Campo>
      </div>
      <Campo label="Nivel de contacto">
        <Selector
          valor={valores.nivel_contacto}
          onChange={(v) => set("nivel_contacto", v)}
          opciones={NIVELES_CONTACTO}
          permitirVacio
        />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Teléfono">
          <Input
            className="h-11"
            inputMode="tel"
            value={valores.telefono}
            onChange={(e) => set("telefono", e.target.value)}
          />
        </Campo>
        <Campo label="Extensión">
          <Input
            className="h-11"
            value={valores.extension}
            onChange={(e) => set("extension", e.target.value)}
          />
        </Campo>
        <Campo label="WhatsApp">
          <Input
            className="h-11"
            inputMode="tel"
            value={valores.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
          />
        </Campo>
        <Campo label="Correo">
          <Input
            className="h-11"
            inputMode="email"
            value={valores.correo}
            onChange={(e) => set("correo", e.target.value)}
          />
        </Campo>
      </div>
      <Campo label="LinkedIn">
        <Input
          className="h-11"
          value={valores.linkedin}
          onChange={(e) => set("linkedin", e.target.value)}
        />
      </Campo>
      <Campo label="Notas">
        <Textarea value={valores.notas} onChange={(e) => set("notas", e.target.value)} rows={3} />
      </Campo>
      <Acciones guardando={guardando} onCancelar={onCancelar} />
    </form>
  );
}

// ----------------------------------------------------------------- VISITA

export function FormVisita({
  registro,
  empresaId,
  onListo,
  onCancelar,
  onNecesidadDetectada,
}: {
  registro?: Visita | null;
  empresaId?: string | null;
  onListo: (id: string) => void;
  onCancelar: () => void;
  onNecesidadDetectada?: (ctx: { empresaId: string; contactoId: string | null }) => void;
}) {
  const { empresas, contactos } = useCrm();
  const invalidar = useInvalidarCrm();
  const [guardando, setGuardando] = useState(false);
  const [avanzado, setAvanzado] = useState(!!registro);
  const { valores, set } = useFormulario({
    empresa_id: registro?.empresa_id ?? empresaId ?? null,
    contacto_id: registro?.contacto_id ?? null,
    fecha: registro?.fecha ?? hoyISO(),
    hora: registro?.hora?.slice(0, 5) ?? horaActual(),
    latitud: registro?.latitud != null ? String(registro.latitud) : "",
    longitud: registro?.longitud != null ? String(registro.longitud) : "",
    tipo_visita: registro?.tipo_visita ?? "Primera visita",
    resultado: registro?.resultado ?? "",
    informacion_obtenida: registro?.informacion_obtenida ?? "",
    material_entregado: registro?.material_entregado ?? "",
    notas: registro?.notas ?? "",
    proxima_accion: registro?.proxima_accion ?? "",
    fecha_proxima_accion: registro?.fecha_proxima_accion ?? "",
    tipo_siguiente: "Seguimiento",
    prioridad_siguiente: "Media",
  });

  const contactosEmpresa = contactos.filter((c) => c.empresa_id === valores.empresa_id);

  const aplicarSugerencia = (resultado: string) => {
    set("resultado", resultado);
    const s = SUGERENCIAS_POR_RESULTADO[resultado];
    if (s) {
      set("proxima_accion", s.objetivo);
      set("fecha_proxima_accion", sumarDias(hoyISO(), s.dias));
      set("tipo_siguiente", s.tipo);
      set("prioridad_siguiente", s.prioridad);
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valores.empresa_id) {
      toast.error("Selecciona la empresa");
      return;
    }
    if (!valores.resultado) {
      toast.error("Selecciona el resultado de la visita");
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        empresa_id: valores.empresa_id,
        contacto_id: valores.contacto_id,
        fecha: valores.fecha || hoyISO(),
        hora: texto(valores.hora),
        latitud: num(valores.latitud),
        longitud: num(valores.longitud),
        tipo_visita: valores.tipo_visita,
        resultado: valores.resultado,
        informacion_obtenida: texto(valores.informacion_obtenida),
        material_entregado: texto(valores.material_entregado),
        notas: texto(valores.notas),
        proxima_accion: texto(valores.proxima_accion),
        fecha_proxima_accion: texto(valores.fecha_proxima_accion),
      };
      let id = registro?.id;
      if (id) {
        await actualizarRegistro("visitas", id, payload);
      } else {
        id = (await crearRegistro("visitas", payload)).id;
        const empresa = empresas.find((x) => x.id === valores.empresa_id);
        const nuevoEstado =
          empresa && empresa.estado_comercial === "Pendiente de visitar"
            ? valores.resultado === "Nombre de contacto obtenido" ||
              valores.contacto_id != null
              ? "Contacto identificado"
              : "Visitada sin contacto"
            : undefined;
        await tocarEmpresa(valores.empresa_id, {
          proxima_accion: texto(valores.proxima_accion),
          fecha_proxima_accion: texto(valores.fecha_proxima_accion),
          ...(nuevoEstado ? { estado_comercial: nuevoEstado } : {}),
        });
        if (texto(valores.proxima_accion) && texto(valores.fecha_proxima_accion)) {
          await crearRegistro("actividades", {
            empresa_id: valores.empresa_id,
            contacto_id: valores.contacto_id,
            tipo: valores.tipo_siguiente,
            fecha: valores.fecha_proxima_accion,
            prioridad: valores.prioridad_siguiente,
            objetivo: valores.proxima_accion,
            estado: "Pendiente",
          });
        }
      }
      invalidar();
      toast.success("Visita registrada");
      if (valores.resultado === "Necesidad detectada" && onNecesidadDetectada) {
        onNecesidadDetectada({
          empresaId: valores.empresa_id,
          contactoId: valores.contacto_id,
        });
      }
      onListo(id);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo label="Empresa *">
        <SelectorEmpresa
          valor={valores.empresa_id}
          onChange={(v) => set("empresa_id", v)}
          empresas={empresas}
        />
      </Campo>

      <Campo label="Resultado *">
        <Selector
          valor={valores.resultado || null}
          onChange={(v) => aplicarSugerencia(v ?? "")}
          opciones={RESULTADOS_VISITA}
          placeholder="¿Qué pasó en la visita?"
        />
      </Campo>

      <Campo label="Nota rápida">
        <Textarea
          value={valores.notas}
          onChange={(e) => set("notas", e.target.value)}
          rows={2}
          placeholder="Opcional"
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Próxima acción">
          <Input
            className="h-11"
            value={valores.proxima_accion}
            onChange={(e) => set("proxima_accion", e.target.value)}
          />
        </Campo>
        <Campo label="Fecha">
          <Input
            className="h-11"
            type="date"
            value={valores.fecha_proxima_accion}
            onChange={(e) => set("fecha_proxima_accion", e.target.value)}
          />
        </Campo>
      </div>
      {SUGERENCIAS_POR_RESULTADO[valores.resultado] ? (
        <Chip nivel="info">Sugerencia aplicada automáticamente según el resultado</Chip>
      ) : null}

      <BotonUbicacion
        onListo={(lat, lng) => {
          set("latitud", String(lat));
          set("longitud", String(lng));
        }}
      />
      {valores.latitud ? (
        <p className="num text-xs text-muted-foreground">
          GPS: {valores.latitud}, {valores.longitud}
        </p>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        className="h-9 w-full text-xs"
        onClick={() => setAvanzado((v) => !v)}
      >
        {avanzado ? "Ocultar detalle" : "Completar más información"}
      </Button>

      {avanzado ? (
        <div className="space-y-3 rounded-lg border bg-surface p-3">
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Fecha">
              <Input
                className="h-11"
                type="date"
                value={valores.fecha}
                onChange={(e) => set("fecha", e.target.value)}
              />
            </Campo>
            <Campo label="Hora">
              <Input
                className="h-11"
                type="time"
                value={valores.hora}
                onChange={(e) => set("hora", e.target.value)}
              />
            </Campo>
          </div>
          <Campo label="Tipo de visita">
            <Selector
              valor={valores.tipo_visita}
              onChange={(v) => set("tipo_visita", v ?? "Primera visita")}
              opciones={TIPOS_VISITA}
            />
          </Campo>
          <Campo label="Contacto">
            <Selector
              valor={valores.contacto_id}
              onChange={(v) => set("contacto_id", v)}
              opciones={contactosEmpresa.map((c) => ({
                valor: c.id,
                etiqueta: `${c.nombre} ${c.apellidos ?? ""}`.trim(),
              }))}
              permitirVacio
              etiquetaVacio="Sin contacto"
            />
          </Campo>
          <Campo label="Información obtenida">
            <Textarea
              value={valores.informacion_obtenida}
              onChange={(e) => set("informacion_obtenida", e.target.value)}
              rows={2}
            />
          </Campo>
          <Campo label="Material entregado">
            <Input
              className="h-11"
              value={valores.material_entregado}
              onChange={(e) => set("material_entregado", e.target.value)}
            />
          </Campo>
        </div>
      ) : null}

      <Acciones guardando={guardando} onCancelar={onCancelar} etiqueta="Guardar visita" />
    </form>
  );
}

// ------------------------------------------------------------ OPORTUNIDAD

export function FormOportunidad({
  registro,
  empresaId,
  contactoId,
  onListo,
  onCancelar,
}: {
  registro?: Oportunidad | null;
  empresaId?: string | null;
  contactoId?: string | null;
  onListo: (id: string) => void;
  onCancelar: () => void;
}) {
  const { empresas, contactos } = useCrm();
  const invalidar = useInvalidarCrm();
  const [guardando, setGuardando] = useState(false);
  const { valores, set } = useFormulario({
    empresa_id: registro?.empresa_id ?? empresaId ?? null,
    contacto_id: registro?.contacto_id ?? contactoId ?? null,
    nombre_proyecto: registro?.nombre_proyecto ?? "",
    necesidad: registro?.necesidad ?? "",
    problema_detectado: registro?.problema_detectado ?? "",
    solucion_propuesta: registro?.solucion_propuesta ?? "",
    valor_estimado: registro?.valor_estimado != null ? String(registro.valor_estimado) : "",
    moneda: registro?.moneda ?? "MXN",
    probabilidad: String(registro?.probabilidad ?? 20),
    fecha_estimada_cierre: registro?.fecha_estimada_cierre ?? "",
    competencia: registro?.competencia ?? "",
    etapa: registro?.etapa ?? "Necesidad detectada",
    notas: registro?.notas ?? "",
    proxima_accion: registro?.proxima_accion ?? "",
    fecha_proxima_accion: registro?.fecha_proxima_accion ?? "",
  });

  const contactosEmpresa = contactos.filter((c) => c.empresa_id === valores.empresa_id);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valores.empresa_id) {
      toast.error("Selecciona la empresa");
      return;
    }
    if (!valores.nombre_proyecto.trim()) {
      toast.error("Escribe el nombre del proyecto");
      return;
    }
    setGuardando(true);
    try {
      const payload = {
        empresa_id: valores.empresa_id,
        contacto_id: valores.contacto_id,
        nombre_proyecto: valores.nombre_proyecto.trim(),
        necesidad: texto(valores.necesidad),
        problema_detectado: texto(valores.problema_detectado),
        solucion_propuesta: texto(valores.solucion_propuesta),
        valor_estimado: num(valores.valor_estimado) ?? 0,
        moneda: valores.moneda,
        probabilidad: num(valores.probabilidad) ?? 0,
        fecha_estimada_cierre: texto(valores.fecha_estimada_cierre),
        competencia: texto(valores.competencia),
        etapa: valores.etapa,
        notas: texto(valores.notas),
        ultima_interaccion: hoyISO(),
        proxima_accion: texto(valores.proxima_accion),
        fecha_proxima_accion: texto(valores.fecha_proxima_accion),
      };
      let id = registro?.id;
      if (id) await actualizarRegistro("oportunidades", id, payload);
      else {
        id = (await crearRegistro("oportunidades", payload)).id;
        const empresa = empresas.find((x) => x.id === valores.empresa_id);
        if (empresa && !["Cliente", "Cotización activa"].includes(empresa.estado_comercial)) {
          await tocarEmpresa(empresa.id, { estado_comercial: "Oportunidad activa" });
        }
      }
      invalidar();
      toast.success("Oportunidad guardada");
      onListo(id);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo label="Empresa *">
        <SelectorEmpresa
          valor={valores.empresa_id}
          onChange={(v) => set("empresa_id", v)}
          empresas={empresas}
        />
      </Campo>
      <Campo label="Contacto">
        <Selector
          valor={valores.contacto_id}
          onChange={(v) => set("contacto_id", v)}
          opciones={contactosEmpresa.map((c) => ({
            valor: c.id,
            etiqueta: `${c.nombre} ${c.apellidos ?? ""}`.trim(),
          }))}
          permitirVacio
          etiquetaVacio="Sin contacto"
        />
      </Campo>
      <Campo label="Nombre del proyecto *">
        <Input
          className="h-11"
          value={valores.nombre_proyecto}
          onChange={(e) => set("nombre_proyecto", e.target.value)}
          required
        />
      </Campo>
      <Campo label="Necesidad">
        <Textarea
          value={valores.necesidad}
          onChange={(e) => set("necesidad", e.target.value)}
          rows={2}
        />
      </Campo>
      <Campo label="Problema detectado">
        <Textarea
          value={valores.problema_detectado}
          onChange={(e) => set("problema_detectado", e.target.value)}
          rows={2}
        />
      </Campo>
      <Campo label="Solución propuesta">
        <Textarea
          value={valores.solucion_propuesta}
          onChange={(e) => set("solucion_propuesta", e.target.value)}
          rows={2}
        />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Valor estimado">
          <Input
            className="h-11"
            inputMode="decimal"
            value={valores.valor_estimado}
            onChange={(e) => set("valor_estimado", e.target.value)}
          />
        </Campo>
        <Campo label="Moneda">
          <Selector
            valor={valores.moneda}
            onChange={(v) => set("moneda", v ?? "MXN")}
            opciones={MONEDAS}
          />
        </Campo>
        <Campo label="Probabilidad (%)">
          <Input
            className="h-11"
            inputMode="numeric"
            value={valores.probabilidad}
            onChange={(e) => set("probabilidad", e.target.value)}
          />
        </Campo>
        <Campo label="Cierre estimado">
          <Input
            className="h-11"
            type="date"
            value={valores.fecha_estimada_cierre}
            onChange={(e) => set("fecha_estimada_cierre", e.target.value)}
          />
        </Campo>
      </div>
      <Campo label="Etapa">
        <Selector
          valor={valores.etapa}
          onChange={(v) => set("etapa", v ?? "Necesidad detectada")}
          opciones={ETAPAS_OPORTUNIDAD}
        />
      </Campo>
      <Campo label="Competencia">
        <Input
          className="h-11"
          value={valores.competencia}
          onChange={(e) => set("competencia", e.target.value)}
        />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Próxima acción">
          <Input
            className="h-11"
            value={valores.proxima_accion}
            onChange={(e) => set("proxima_accion", e.target.value)}
          />
        </Campo>
        <Campo label="Fecha">
          <Input
            className="h-11"
            type="date"
            value={valores.fecha_proxima_accion}
            onChange={(e) => set("fecha_proxima_accion", e.target.value)}
          />
        </Campo>
      </div>
      <Campo label="Notas">
        <Textarea value={valores.notas} onChange={(e) => set("notas", e.target.value)} rows={2} />
      </Campo>
      <Acciones guardando={guardando} onCancelar={onCancelar} />
    </form>
  );
}

// ------------------------------------------------------------- COTIZACIÓN

export function FormCotizacion({
  registro,
  empresaId,
  oportunidadId,
  onListo,
  onCancelar,
}: {
  registro?: Cotizacion | null;
  empresaId?: string | null;
  oportunidadId?: string | null;
  onListo: (id: string) => void;
  onCancelar: () => void;
}) {
  const { empresas, contactos, oportunidades } = useCrm();
  const invalidar = useInvalidarCrm();
  const [guardando, setGuardando] = useState(false);
  const { valores, set } = useFormulario({
    empresa_id: registro?.empresa_id ?? empresaId ?? null,
    contacto_id: registro?.contacto_id ?? null,
    oportunidad_id: registro?.oportunidad_id ?? oportunidadId ?? null,
    folio: registro?.folio ?? `COT-${hoyISO().replace(/-/g, "").slice(2)}`,
    fecha: registro?.fecha ?? hoyISO(),
    descripcion: registro?.descripcion ?? "",
    importe: registro?.importe != null ? String(registro.importe) : "",
    moneda: registro?.moneda ?? "MXN",
    vigencia: registro?.vigencia ?? "",
    tiempo_entrega: registro?.tiempo_entrega ?? "",
    estado: registro?.estado ?? "Preparación",
    fecha_proximo_seguimiento: registro?.fecha_proximo_seguimiento ?? "",
    notas: registro?.notas ?? "",
  });

  const contactosEmpresa = contactos.filter((c) => c.empresa_id === valores.empresa_id);
  const oportunidadesEmpresa = oportunidades.filter((o) => o.empresa_id === valores.empresa_id);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valores.empresa_id) {
      toast.error("Selecciona la empresa");
      return;
    }
    if (!valores.folio.trim()) {
      toast.error("Captura el folio");
      return;
    }
    setGuardando(true);
    try {
      const seVuelveEnviada = valores.estado === "Enviada" && registro?.estado !== "Enviada";
      const proximoSeguimiento = seVuelveEnviada
        ? sumarDias(hoyISO(), 3)
        : texto(valores.fecha_proximo_seguimiento);

      const payload = {
        empresa_id: valores.empresa_id,
        contacto_id: valores.contacto_id,
        oportunidad_id: valores.oportunidad_id,
        folio: valores.folio.trim(),
        fecha: valores.fecha || hoyISO(),
        descripcion: texto(valores.descripcion),
        importe: num(valores.importe) ?? 0,
        moneda: valores.moneda,
        vigencia: texto(valores.vigencia),
        tiempo_entrega: texto(valores.tiempo_entrega),
        estado: valores.estado,
        fecha_proximo_seguimiento: proximoSeguimiento,
        ...(seVuelveEnviada ? { fecha_ultimo_seguimiento: hoyISO() } : {}),
        notas: texto(valores.notas),
      };

      let id = registro?.id;
      if (id) await actualizarRegistro("cotizaciones", id, payload);
      else id = (await crearRegistro("cotizaciones", payload)).id;

      if (seVuelveEnviada) {
        await crearRegistro("actividades", {
          empresa_id: valores.empresa_id,
          contacto_id: valores.contacto_id,
          oportunidad_id: valores.oportunidad_id,
          cotizacion_id: id,
          tipo: "Seguimiento de cotización",
          fecha: sumarDias(hoyISO(), 3),
          prioridad: "Alta",
          objetivo: `Seguimiento de cotización ${valores.folio}`,
          estado: "Pendiente",
        });
        const empresa = empresas.find((x) => x.id === valores.empresa_id);
        if (empresa && empresa.estado_comercial !== "Cliente") {
          await tocarEmpresa(empresa.id, { estado_comercial: "Cotización activa" });
        }
        toast.success("Cotización enviada — seguimiento creado a 3 días");
      } else {
        toast.success("Cotización guardada");
      }
      invalidar();
      onListo(id);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo label="Empresa *">
        <SelectorEmpresa
          valor={valores.empresa_id}
          onChange={(v) => set("empresa_id", v)}
          empresas={empresas}
        />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Contacto">
          <Selector
            valor={valores.contacto_id}
            onChange={(v) => set("contacto_id", v)}
            opciones={contactosEmpresa.map((c) => ({
              valor: c.id,
              etiqueta: `${c.nombre} ${c.apellidos ?? ""}`.trim(),
            }))}
            permitirVacio
            etiquetaVacio="Sin contacto"
          />
        </Campo>
        <Campo label="Oportunidad">
          <Selector
            valor={valores.oportunidad_id}
            onChange={(v) => set("oportunidad_id", v)}
            opciones={oportunidadesEmpresa.map((o) => ({
              valor: o.id,
              etiqueta: o.nombre_proyecto,
            }))}
            permitirVacio
            etiquetaVacio="Sin oportunidad"
          />
        </Campo>
        <Campo label="Folio *">
          <Input
            className="h-11"
            value={valores.folio}
            onChange={(e) => set("folio", e.target.value)}
            required
          />
        </Campo>
        <Campo label="Fecha">
          <Input
            className="h-11"
            type="date"
            value={valores.fecha}
            onChange={(e) => set("fecha", e.target.value)}
          />
        </Campo>
        <Campo label="Importe">
          <Input
            className="h-11"
            inputMode="decimal"
            value={valores.importe}
            onChange={(e) => set("importe", e.target.value)}
          />
        </Campo>
        <Campo label="Moneda">
          <Selector
            valor={valores.moneda}
            onChange={(v) => set("moneda", v ?? "MXN")}
            opciones={MONEDAS}
          />
        </Campo>
        <Campo label="Vigencia">
          <Input
            className="h-11"
            type="date"
            value={valores.vigencia}
            onChange={(e) => set("vigencia", e.target.value)}
          />
        </Campo>
        <Campo label="Tiempo de entrega">
          <Input
            className="h-11"
            value={valores.tiempo_entrega}
            onChange={(e) => set("tiempo_entrega", e.target.value)}
          />
        </Campo>
      </div>
      <Campo label="Descripción">
        <Textarea
          value={valores.descripcion}
          onChange={(e) => set("descripcion", e.target.value)}
          rows={2}
        />
      </Campo>
      <Campo
        label="Estado"
        hint="Al marcarla como Enviada se crea automáticamente el seguimiento a 3 días."
      >
        <Selector
          valor={valores.estado}
          onChange={(v) => set("estado", v ?? "Preparación")}
          opciones={ESTADOS_COTIZACION}
        />
      </Campo>
      <Campo label="Próximo seguimiento">
        <Input
          className="h-11"
          type="date"
          value={valores.fecha_proximo_seguimiento}
          onChange={(e) => set("fecha_proximo_seguimiento", e.target.value)}
        />
      </Campo>
      <Campo label="Notas">
        <Textarea value={valores.notas} onChange={(e) => set("notas", e.target.value)} rows={2} />
      </Campo>
      <Acciones guardando={guardando} onCancelar={onCancelar} />
    </form>
  );
}

// -------------------------------------------------------------- ACTIVIDAD

export function FormActividad({
  registro,
  empresaId,
  oportunidadId,
  cotizacionId,
  contactoId,
  onListo,
  onCancelar,
}: {
  registro?: Actividad | null;
  empresaId?: string | null;
  oportunidadId?: string | null;
  cotizacionId?: string | null;
  contactoId?: string | null;
  onListo: (id: string) => void;
  onCancelar: () => void;
}) {
  const { empresas, contactos } = useCrm();
  const invalidar = useInvalidarCrm();
  const [guardando, setGuardando] = useState(false);
  const { valores, set } = useFormulario({
    empresa_id: registro?.empresa_id ?? empresaId ?? null,
    contacto_id: registro?.contacto_id ?? contactoId ?? null,
    oportunidad_id: registro?.oportunidad_id ?? oportunidadId ?? null,
    cotizacion_id: registro?.cotizacion_id ?? cotizacionId ?? null,
    tipo: registro?.tipo ?? "Seguimiento",
    fecha: registro?.fecha ?? hoyISO(),
    hora: registro?.hora?.slice(0, 5) ?? "",
    prioridad: registro?.prioridad ?? "Media",
    objetivo: registro?.objetivo ?? "",
    estado: registro?.estado ?? "Pendiente",
    resultado: registro?.resultado ?? "",
    notas: registro?.notas ?? "",
  });

  const contactosEmpresa = contactos.filter((c) => c.empresa_id === valores.empresa_id);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = {
        empresa_id: valores.empresa_id,
        contacto_id: valores.contacto_id,
        oportunidad_id: valores.oportunidad_id,
        cotizacion_id: valores.cotizacion_id,
        tipo: valores.tipo,
        fecha: valores.fecha || hoyISO(),
        hora: texto(valores.hora),
        prioridad: valores.prioridad,
        objetivo: texto(valores.objetivo),
        estado: valores.estado,
        resultado: texto(valores.resultado),
        notas: texto(valores.notas),
      };
      let id = registro?.id;
      if (id) await actualizarRegistro("actividades", id, payload);
      else id = (await crearRegistro("actividades", payload)).id;
      if (valores.empresa_id) {
        await tocarEmpresa(valores.empresa_id, {
          proxima_accion: valores.estado === "Pendiente" ? texto(valores.objetivo) : null,
          fecha_proxima_accion: valores.estado === "Pendiente" ? valores.fecha : null,
        });
      }
      invalidar();
      toast.success("Actividad guardada");
      onListo(id);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo label="Empresa">
        <SelectorEmpresa
          valor={valores.empresa_id}
          onChange={(v) => set("empresa_id", v)}
          empresas={empresas}
        />
      </Campo>
      <Campo label="Contacto">
        <Selector
          valor={valores.contacto_id}
          onChange={(v) => set("contacto_id", v)}
          opciones={contactosEmpresa.map((c) => ({
            valor: c.id,
            etiqueta: `${c.nombre} ${c.apellidos ?? ""}`.trim(),
          }))}
          permitirVacio
          etiquetaVacio="Sin contacto"
        />
      </Campo>
      <Campo label="Tipo">
        <Selector
          valor={valores.tipo}
          onChange={(v) => set("tipo", v ?? "Seguimiento")}
          opciones={TIPOS_ACTIVIDAD}
        />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Fecha">
          <Input
            className="h-11"
            type="date"
            value={valores.fecha}
            onChange={(e) => set("fecha", e.target.value)}
          />
        </Campo>
        <Campo label="Hora">
          <Input
            className="h-11"
            type="time"
            value={valores.hora}
            onChange={(e) => set("hora", e.target.value)}
          />
        </Campo>
        <Campo label="Prioridad">
          <Selector
            valor={valores.prioridad}
            onChange={(v) => set("prioridad", v ?? "Media")}
            opciones={PRIORIDADES}
          />
        </Campo>
        <Campo label="Estado">
          <Selector
            valor={valores.estado}
            onChange={(v) => set("estado", v ?? "Pendiente")}
            opciones={ESTADOS_ACTIVIDAD}
          />
        </Campo>
      </div>
      <Campo label="Objetivo">
        <Input
          className="h-11"
          value={valores.objetivo}
          onChange={(e) => set("objetivo", e.target.value)}
        />
      </Campo>
      <Campo label="Resultado">
        <Input
          className="h-11"
          value={valores.resultado}
          onChange={(e) => set("resultado", e.target.value)}
        />
      </Campo>
      <Campo label="Notas">
        <Textarea value={valores.notas} onChange={(e) => set("notas", e.target.value)} rows={2} />
      </Campo>
      <Acciones guardando={guardando} onCancelar={onCancelar} />
    </form>
  );
}

// ------------------------------------------------- COMPLETAR + ¿QUÉ SIGUE?

export function FormCompletarActividad({
  actividad,
  onListo,
  onCancelar,
  onSiguiente,
}: {
  actividad: Actividad;
  onListo: () => void;
  onCancelar: () => void;
  onSiguiente: (ctx: { empresaId: string | null; contactoId: string | null }) => void;
}) {
  const invalidar = useInvalidarCrm();
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState(actividad.resultado ?? "");

  const completar = async (siguiente: boolean) => {
    setGuardando(true);
    try {
      await actualizarRegistro("actividades", actividad.id, {
        estado: "Completada",
        resultado: resultado.trim() || "Completada",
      });
      if (actividad.empresa_id) {
        await tocarEmpresa(actividad.empresa_id, {});
      }
      invalidar();
      toast.success("Actividad completada");
      if (siguiente) {
        onSiguiente({ empresaId: actividad.empresa_id, contactoId: actividad.contacto_id });
      } else {
        onListo();
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      <Campo label="Resultado">
        <Textarea
          value={resultado}
          onChange={(e) => setResultado(e.target.value)}
          rows={3}
          placeholder="¿Qué ocurrió?"
        />
      </Campo>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          ¿Qué sigue?
        </p>
        <Button
          type="button"
          className="h-11 w-full"
          disabled={guardando}
          onClick={() => completar(true)}
        >
          Completar y crear siguiente actividad
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-full"
          disabled={guardando}
          onClick={() => completar(false)}
        >
          Solo completar
        </Button>
        <Button type="button" variant="ghost" className="h-10 w-full" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

/** Decisión explícita sobre una empresa activa sin próxima acción. */
export function DecisionEmpresa({
  empresa,
  onListo,
  onProgramar,
}: {
  empresa: Empresa;
  onListo: () => void;
  onProgramar: () => void;
}) {
  const invalidar = useInvalidarCrm();
  const cambiar = async (estado: string) => {
    await actualizarRegistro("empresas", empresa.id, {
      estado_comercial: estado,
      proxima_accion: null,
      fecha_proxima_accion: null,
    });
    invalidar();
    toast.success(`Empresa movida a ${estado}`);
    onListo();
  };
  return (
    <div className="space-y-2">
      <Button type="button" className="h-11 w-full" onClick={onProgramar}>
        Programar siguiente actividad
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="h-11 w-full"
        onClick={() => cambiar("Prospecto dormido")}
      >
        Mover a prospecto dormido
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={() => cambiar("Descartada")}
      >
        Descartar empresa
      </Button>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tablas = Database["public"]["Tables"];
export type Empresa = Tablas["empresas"]["Row"];
export type Contacto = Tablas["contactos"]["Row"];
export type Visita = Tablas["visitas"]["Row"];
export type Oportunidad = Tablas["oportunidades"]["Row"];
export type Cotizacion = Tablas["cotizaciones"]["Row"];
export type Actividad = Tablas["actividades"]["Row"];

export type TablaCrm =
  | "empresas"
  | "contactos"
  | "visitas"
  | "oportunidades"
  | "cotizaciones"
  | "actividades";

const ORDEN: Record<TablaCrm, { columna: string; asc: boolean }> = {
  empresas: { columna: "nombre", asc: true },
  contactos: { columna: "nombre", asc: true },
  visitas: { columna: "fecha", asc: false },
  oportunidades: { columna: "created_at", asc: false },
  cotizaciones: { columna: "fecha", asc: false },
  actividades: { columna: "fecha", asc: true },
};

async function listar(tabla: TablaCrm) {
  const orden = ORDEN[tabla];
  const { data, error } = await supabase
    .from(tabla)
    .select("*")
    .order(orden.columna, { ascending: orden.asc });
  if (error) throw error;
  return data ?? [];
}

export function useEmpresas() {
  return useQuery({ queryKey: ["empresas"], queryFn: () => listar("empresas") as Promise<Empresa[]> });
}
export function useContactos() {
  return useQuery({
    queryKey: ["contactos"],
    queryFn: () => listar("contactos") as Promise<Contacto[]>,
  });
}
export function useVisitas() {
  return useQuery({ queryKey: ["visitas"], queryFn: () => listar("visitas") as Promise<Visita[]> });
}
export function useOportunidades() {
  return useQuery({
    queryKey: ["oportunidades"],
    queryFn: () => listar("oportunidades") as Promise<Oportunidad[]>,
  });
}
export function useCotizaciones() {
  return useQuery({
    queryKey: ["cotizaciones"],
    queryFn: () => listar("cotizaciones") as Promise<Cotizacion[]>,
  });
}
export function useActividades() {
  return useQuery({
    queryKey: ["actividades"],
    queryFn: () => listar("actividades") as Promise<Actividad[]>,
  });
}

/** Todos los datos del CRM: el volumen de un solo usuario lo permite y simplifica los cálculos. */
export function useCrm() {
  const empresas = useEmpresas();
  const contactos = useContactos();
  const visitas = useVisitas();
  const oportunidades = useOportunidades();
  const cotizaciones = useCotizaciones();
  const actividades = useActividades();

  return {
    empresas: empresas.data ?? [],
    contactos: contactos.data ?? [],
    visitas: visitas.data ?? [],
    oportunidades: oportunidades.data ?? [],
    cotizaciones: cotizaciones.data ?? [],
    actividades: actividades.data ?? [],
    cargando:
      empresas.isLoading ||
      contactos.isLoading ||
      visitas.isLoading ||
      oportunidades.isLoading ||
      cotizaciones.isLoading ||
      actividades.isLoading,
    error:
      empresas.error ??
      contactos.error ??
      visitas.error ??
      oportunidades.error ??
      cotizaciones.error ??
      actividades.error ??
      null,
  };
}

function invalidarTodo(qc: ReturnType<typeof useQueryClient>) {
  for (const t of [
    "empresas",
    "contactos",
    "visitas",
    "oportunidades",
    "cotizaciones",
    "actividades",
  ]) {
    void qc.invalidateQueries({ queryKey: [t] });
  }
}

export async function crearRegistro<T extends Record<string, unknown>>(
  tabla: TablaCrm,
  valores: T,
): Promise<{ id: string }> {
  const { data: sesion } = await supabase.auth.getUser();
  const payload = { ...valores, owner_id: sesion.user?.id ?? null };
  const { data, error } = await supabase
    .from(tabla)
    .insert(payload as never)
    .select("id")
    .single();
  if (error) throw error;
  return data as { id: string };
}

export async function actualizarRegistro(
  tabla: TablaCrm,
  id: string,
  valores: Record<string, unknown>,
) {
  const { error } = await supabase
    .from(tabla)
    .update(valores as never)
    .eq("id", id);
  if (error) throw error;
}

export async function eliminarRegistro(tabla: TablaCrm, id: string) {
  const { error } = await supabase.from(tabla).delete().eq("id", id);
  if (error) throw error;
}

export function useGuardar(tabla: TablaCrm) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, valores }: { id?: string; valores: Record<string, unknown> }) => {
      if (id) {
        await actualizarRegistro(tabla, id, valores);
        return { id };
      }
      return crearRegistro(tabla, valores);
    },
    onSuccess: () => invalidarTodo(qc),
  });
}

export function useEliminar(tabla: TablaCrm) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarRegistro(tabla, id),
    onSuccess: () => invalidarTodo(qc),
  });
}

export function useInvalidarCrm() {
  const qc = useQueryClient();
  return () => invalidarTodo(qc);
}

/** Cancela los seguimientos pendientes ligados a una oportunidad (evita alertas falsas). */
export async function cancelarSeguimientosDeOportunidad(oportunidadId: string) {
  const { error } = await supabase
    .from("actividades")
    .update({ estado: "Cancelada" } as never)
    .eq("oportunidad_id", oportunidadId)
    .eq("estado", "Pendiente");
  if (error) throw error;
}

export type DatosPerdida = {
  motivo_perdida: string;
  nota_perdida: string | null;
  competidor_ganador: string | null;
  fecha_perdida: string;
};

/** Marca una oportunidad como perdida y limpia sus seguimientos pendientes. */
export async function marcarOportunidadPerdida(id: string, datos: DatosPerdida) {
  await actualizarRegistro("oportunidades", id, {
    etapa: "Perdida",
    probabilidad: 0,
    proxima_accion: null,
    fecha_proxima_accion: null,
    ...datos,
  });
  await cancelarSeguimientosDeOportunidad(id);
}

/** Los registros de demostración son los sembrados sin dueño (owner_id nulo). */
export const esDemo = (r: { owner_id: string | null }) => r.owner_id == null;

export async function eliminarDatosDemo() {
  for (const tabla of [
    "actividades",
    "cotizaciones",
    "oportunidades",
    "visitas",
    "contactos",
    "empresas",
  ] as TablaCrm[]) {
    const { error } = await supabase.from(tabla).delete().is("owner_id", null);
    if (error) throw error;
  }
}

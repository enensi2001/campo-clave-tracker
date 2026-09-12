import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DecisionEmpresa,
  FormActividad,
  FormCompletarActividad,
  FormContacto,
  FormCotizacion,
  FormEmpresa,
  FormOportunidad,
  FormPerdida,
  FormVisita,
} from "@/components/crm/forms";
import {
  eliminarRegistro,
  useCrm,
  useInvalidarCrm,
  type Actividad,
  type Contacto,
  type Cotizacion,
  type Empresa,
  type Oportunidad,
  type TablaCrm,
  type Visita,
} from "@/lib/crm/data";
import { dependencias } from "@/lib/crm/logic";

type Prefill = {
  empresaId?: string | null | undefined;
  contactoId?: string | null | undefined;
  oportunidadId?: string | null | undefined;
  cotizacionId?: string | null | undefined;
};

export type Objetivo = { tabla: TablaCrm; id: string; nombre: string };

type Estado =
  | { tipo: "empresa"; registro?: Empresa | null | undefined }
  | { tipo: "contacto"; registro?: Contacto | null | undefined; prefill?: Prefill | undefined }
  | { tipo: "visita"; registro?: Visita | null | undefined; prefill?: Prefill | undefined }
  | {
      tipo: "oportunidad";
      registro?: Oportunidad | null | undefined;
      prefill?: Prefill | undefined;
    }
  | { tipo: "cotizacion"; registro?: Cotizacion | null | undefined; prefill?: Prefill | undefined }
  | { tipo: "actividad"; registro?: Actividad | null | undefined; prefill?: Prefill | undefined }
  | { tipo: "completar"; actividad: Actividad }
  | { tipo: "decision"; empresa: Empresa }
  | { tipo: "perdida"; oportunidad: Oportunidad }
  | null;

type Api = {
  empresa: (registro?: Empresa | null) => void;
  contacto: (prefill?: Prefill, registro?: Contacto | null) => void;
  visita: (prefill?: Prefill, registro?: Visita | null) => void;
  oportunidad: (prefill?: Prefill, registro?: Oportunidad | null) => void;
  cotizacion: (prefill?: Prefill, registro?: Cotizacion | null) => void;
  actividad: (prefill?: Prefill, registro?: Actividad | null) => void;
  completar: (actividad: Actividad) => void;
  decision: (empresa: Empresa) => void;
  perdida: (oportunidad: Oportunidad) => void;
  eliminar: (objetivo: Objetivo) => void;
};

const Contexto = createContext<Api | null>(null);

export function useDialogos(): Api {
  const api = useContext(Contexto);
  if (!api) throw new Error("useDialogos requiere DialogosProvider");
  return api;
}

/** Botón de eliminación reutilizable para tarjetas, filas y fichas. */
export function BotonEliminar({
  tabla,
  id,
  nombre,
  className,
  variant = "outline",
  etiqueta,
}: {
  tabla: TablaCrm;
  id: string;
  nombre: string;
  className?: string;
  variant?: "outline" | "ghost" | "destructive";
  etiqueta?: string;
}) {
  const dialogos = useDialogos();
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      className={className ?? "h-9"}
      onClick={() => dialogos.eliminar({ tabla, id, nombre })}
      aria-label={`Eliminar ${nombre}`}
    >
      <Trash2 className="size-4" />
      {etiqueta ?? "Eliminar"}
    </Button>
  );
}

const TITULOS: Record<string, { titulo: string; descripcion: string }> = {
  empresa: { titulo: "Empresa", descripcion: "Datos de la empresa y su próxima acción." },
  contacto: { titulo: "Contacto", descripcion: "Contacto asociado a una empresa." },
  visita: {
    titulo: "Registrar visita",
    descripcion: "Captura rápida: empresa, resultado y próxima acción.",
  },
  oportunidad: {
    titulo: "Oportunidad",
    descripcion: "Créala solo cuando exista una necesidad comercial real.",
  },
  cotizacion: { titulo: "Cotización", descripcion: "Documento comercial y su seguimiento." },
  actividad: { titulo: "Actividad", descripcion: "Agenda comercial." },
  completar: {
    titulo: "Completar actividad",
    descripcion: "Registra el resultado y decide qué sigue.",
  },
  decision: {
    titulo: "¿Qué sigue con esta empresa?",
    descripcion: "Toda empresa activa necesita una próxima acción o una decisión explícita.",
  },
  perdida: {
    titulo: "Marcar oportunidad como perdida",
    descripcion: "Registra el motivo para no perder el aprendizaje comercial.",
  },
};

const ETIQUETA_TABLA: Record<TablaCrm, string> = {
  empresas: "empresa",
  contactos: "contacto",
  visitas: "visita",
  oportunidades: "oportunidad",
  cotizaciones: "cotización",
  actividades: "actividad",
};

export function DialogosProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(null);
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const navigate = useNavigate();
  const datos = useCrm();
  const invalidar = useInvalidarCrm();

  const api = useMemo<Api>(
    () => ({
      empresa: (registro) => setEstado({ tipo: "empresa", registro }),
      contacto: (prefill, registro) => setEstado({ tipo: "contacto", prefill, registro }),
      visita: (prefill, registro) => setEstado({ tipo: "visita", prefill, registro }),
      oportunidad: (prefill, registro) => setEstado({ tipo: "oportunidad", prefill, registro }),
      cotizacion: (prefill, registro) => setEstado({ tipo: "cotizacion", prefill, registro }),
      actividad: (prefill, registro) => setEstado({ tipo: "actividad", prefill, registro }),
      completar: (actividad) => setEstado({ tipo: "completar", actividad }),
      decision: (empresa) => setEstado({ tipo: "decision", empresa }),
      perdida: (oportunidad) => setEstado({ tipo: "perdida", oportunidad }),
      eliminar: (obj) => setObjetivo(obj),
    }),
    [],
  );

  const cerrar = () => setEstado(null);
  const meta = estado ? TITULOS[estado.tipo] : undefined;

  const relacionados = objetivo ? dependencias(datos, objetivo.tabla, objetivo.id) : [];
  const cascada = relacionados.filter((r) => r.enCascada);
  const referencias = relacionados.filter((r) => !r.enCascada);

  const confirmarEliminar = async () => {
    if (!objetivo) return;
    setEliminando(true);
    try {
      await eliminarRegistro(objetivo.tabla, objetivo.id);
      invalidar();
      toast.success(`${objetivo.nombre} eliminado`);
      const eraEmpresa = objetivo.tabla === "empresas";
      setObjetivo(null);
      setEstado(null);
      if (eraEmpresa) void navigate({ to: "/empresas" });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setEliminando(false);
    }
  };

  const registroEditado: Objetivo | null = (() => {
    if (!estado) return null;
    if (estado.tipo === "empresa" && estado.registro)
      return { tabla: "empresas", id: estado.registro.id, nombre: estado.registro.nombre };
    if (estado.tipo === "contacto" && estado.registro)
      return {
        tabla: "contactos",
        id: estado.registro.id,
        nombre: `${estado.registro.nombre} ${estado.registro.apellidos ?? ""}`.trim(),
      };
    if (estado.tipo === "visita" && estado.registro)
      return {
        tabla: "visitas",
        id: estado.registro.id,
        nombre: `Visita del ${estado.registro.fecha}`,
      };
    if (estado.tipo === "oportunidad" && estado.registro)
      return {
        tabla: "oportunidades",
        id: estado.registro.id,
        nombre: estado.registro.nombre_proyecto,
      };
    if (estado.tipo === "cotizacion" && estado.registro)
      return { tabla: "cotizaciones", id: estado.registro.id, nombre: estado.registro.folio };
    if (estado.tipo === "actividad" && estado.registro)
      return {
        tabla: "actividades",
        id: estado.registro.id,
        nombre: `${estado.registro.tipo} del ${estado.registro.fecha}`,
      };
    if (estado.tipo === "completar")
      return {
        tabla: "actividades",
        id: estado.actividad.id,
        nombre: `${estado.actividad.tipo} del ${estado.actividad.fecha}`,
      };
    return null;
  })();

  return (
    <Contexto.Provider value={api}>
      {children}
      <Dialog open={estado != null} onOpenChange={(abierto) => (abierto ? null : cerrar())}>
        <DialogContent className="max-h-[92vh] gap-4 overflow-y-auto sm:max-w-lg">
          <DialogHeader className="text-left">
            <DialogTitle>{meta?.titulo ?? ""}</DialogTitle>
            <DialogDescription>{meta?.descripcion ?? ""}</DialogDescription>
          </DialogHeader>

          {estado?.tipo === "empresa" ? (
            <FormEmpresa
              registro={estado.registro}
              onCancelar={cerrar}
              onListo={(id) => {
                cerrar();
                if (!estado.registro) void navigate({ to: "/empresas/$id", params: { id } });
              }}
            />
          ) : null}

          {estado?.tipo === "contacto" ? (
            <FormContacto
              registro={estado.registro}
              empresaId={estado.prefill?.empresaId ?? null}
              onCancelar={cerrar}
              onListo={cerrar}
            />
          ) : null}

          {estado?.tipo === "visita" ? (
            <FormVisita
              registro={estado.registro}
              empresaId={estado.prefill?.empresaId ?? null}
              onCancelar={cerrar}
              onListo={cerrar}
              onNecesidadDetectada={(ctx) =>
                setEstado({
                  tipo: "oportunidad",
                  prefill: { empresaId: ctx.empresaId, contactoId: ctx.contactoId },
                })
              }
            />
          ) : null}

          {estado?.tipo === "oportunidad" ? (
            <FormOportunidad
              registro={estado.registro}
              empresaId={estado.prefill?.empresaId ?? null}
              contactoId={estado.prefill?.contactoId ?? null}
              onCancelar={cerrar}
              onListo={cerrar}
            />
          ) : null}

          {estado?.tipo === "cotizacion" ? (
            <FormCotizacion
              registro={estado.registro}
              empresaId={estado.prefill?.empresaId ?? null}
              oportunidadId={estado.prefill?.oportunidadId ?? null}
              onCancelar={cerrar}
              onListo={cerrar}
            />
          ) : null}

          {estado?.tipo === "actividad" ? (
            <FormActividad
              registro={estado.registro}
              empresaId={estado.prefill?.empresaId ?? null}
              contactoId={estado.prefill?.contactoId ?? null}
              oportunidadId={estado.prefill?.oportunidadId ?? null}
              cotizacionId={estado.prefill?.cotizacionId ?? null}
              onCancelar={cerrar}
              onListo={cerrar}
            />
          ) : null}

          {estado?.tipo === "completar" ? (
            <FormCompletarActividad
              actividad={estado.actividad}
              onCancelar={cerrar}
              onListo={cerrar}
              onSiguiente={(ctx) =>
                setEstado({
                  tipo: "actividad",
                  prefill: { empresaId: ctx.empresaId, contactoId: ctx.contactoId },
                })
              }
            />
          ) : null}

          {estado?.tipo === "decision" ? (
            <DecisionEmpresa
              empresa={estado.empresa}
              onListo={cerrar}
              onProgramar={() =>
                setEstado({ tipo: "actividad", prefill: { empresaId: estado.empresa.id } })
              }
            />
          ) : null}

          {estado?.tipo === "perdida" ? (
            <FormPerdida oportunidad={estado.oportunidad} onCancelar={cerrar} onListo={cerrar} />
          ) : null}

          {registroEditado ? (
            <div className="border-t pt-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full text-danger-foreground"
                onClick={() => setObjetivo(registroEditado)}
              >
                <Trash2 className="size-4" /> Eliminar {ETIQUETA_TABLA[registroEditado.tabla]}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={objetivo != null}
        onOpenChange={(abierto) => (abierto ? null : setObjetivo(null))}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle>
              ¿Eliminar {objetivo ? ETIQUETA_TABLA[objetivo.tabla] : ""} «{objetivo?.nombre}»?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Esta acción es permanente y no se puede deshacer.</p>
                {cascada.length > 0 ? (
                  <div>
                    <p className="font-medium text-danger-foreground">
                      También se eliminarán en cascada:
                    </p>
                    <ul className="list-disc pl-5">
                      {cascada.map((r) => (
                        <li key={r.etiqueta}>
                          {r.cantidad} {r.etiqueta}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {referencias.length > 0 ? (
                  <div>
                    <p className="font-medium">Quedarán sin esta referencia (se conservan):</p>
                    <ul className="list-disc pl-5">
                      {referencias.map((r) => (
                        <li key={r.etiqueta}>
                          {r.cantidad} {r.etiqueta}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {relacionados.length === 0 ? <p>No hay registros relacionados.</p> : null}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="h-11 bg-danger text-danger-foreground hover:bg-danger/90"
              disabled={eliminando}
              onClick={(e) => {
                e.preventDefault();
                void confirmarEliminar();
              }}
            >
              Eliminar definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Contexto.Provider>
  );
}

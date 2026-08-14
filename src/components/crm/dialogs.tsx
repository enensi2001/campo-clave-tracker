import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

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
  FormVisita,
} from "@/components/crm/forms";
import type {
  Actividad,
  Contacto,
  Cotizacion,
  Empresa,
  Oportunidad,
  Visita,
} from "@/lib/crm/data";

type Prefill = {
  empresaId?: string | null | undefined;
  contactoId?: string | null | undefined;
  oportunidadId?: string | null | undefined;
  cotizacionId?: string | null | undefined;
};

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
};

const Contexto = createContext<Api | null>(null);

export function useDialogos(): Api {
  const api = useContext(Contexto);
  if (!api) throw new Error("useDialogos requiere DialogosProvider");
  return api;
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
  completar: { titulo: "Completar actividad", descripcion: "Registra el resultado y decide qué sigue." },
  decision: {
    titulo: "¿Qué sigue con esta empresa?",
    descripcion: "Toda empresa activa necesita una próxima acción o una decisión explícita.",
  },
};

export function DialogosProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(null);
  const navigate = useNavigate();

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
    }),
    [],
  );

  const cerrar = () => setEstado(null);
  const meta = estado ? TITULOS[estado.tipo] : undefined;

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
        </DialogContent>
      </Dialog>
    </Contexto.Provider>
  );
}

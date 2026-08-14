import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AlertTriangle, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Chip, Metrica, Seccion, Vacio } from "@/components/crm/ui-bits";
import { FilaActividad } from "@/components/crm/listas";
import { useDialogos } from "@/components/crm/dialogs";
import { useCrm } from "@/lib/crm/data";
import { dinero, fechaCorta, hoyISO } from "@/lib/crm/format";
import {
  actividadHoy,
  actividadVencida,
  calcularActividadPeriodo,
  calcularAtencion,
  calcularPipeline,
  calcularPipelineConstruccion,
  prioridadDeHoy,
  rangoDesde,
  type Atencion,
} from "@/lib/crm/logic";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({
    meta: [
      { title: "Hoy — CRM Industrial" },
      {
        name: "description",
        content: "Panel accionable: qué visitar, qué dar seguimiento y qué cotizaciones cerrar hoy.",
      },
      { property: "og:title", content: "Hoy — CRM Industrial" },
      { property: "og:description", content: "Panel accionable de prospección y seguimiento." },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  const datos = useCrm();
  const dialogos = useDialogos();
  const router = useRouter();

  const pipeline = calcularPipeline(datos);
  const atencion = calcularAtencion(datos);
  const construccion = calcularPipelineConstruccion(datos);
  const mes = calcularActividadPeriodo(datos, rangoDesde("mes"));
  const prioridades = prioridadDeHoy(datos);

  const hoy = datos.actividades.filter(actividadHoy);
  const vencidas = datos.actividades.filter(actividadVencida);

  const irA = (ruta: Atencion["ruta"]) => {
    void router.navigate({ to: ruta.to, params: ruta.params } as never);
  };

  if (datos.cargando) {
    return (
      <>
        <Encabezado titulo="Hoy" subtitulo="Cargando información…" />
        <Contenido>
          <Vacio>Preparando tu panel comercial…</Vacio>
        </Contenido>
      </>
    );
  }

  return (
    <>
      <Encabezado
        titulo="¿Qué tengo que hacer hoy?"
        subtitulo={fechaCorta(hoyISO())}
        accion={
          <Button size="sm" className="h-9" onClick={() => dialogos.visita()}>
            Registrar visita
          </Button>
        }
      />
      <Contenido>
        <Seccion titulo="Prioridad de hoy" nota="Ordenado por urgencia comercial.">
          {prioridades.length === 0 ? (
            <Vacio>Todo al día. Aprovecha para prospectar en campo.</Vacio>
          ) : (
            <ul className="space-y-2">
              {prioridades.map((p) => (
                <li key={p.clave}>
                  <button
                    className="flex w-full items-center justify-between gap-2 rounded-lg border bg-card p-3 text-left"
                    onClick={() => irA(p.ruta)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{p.titulo}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.detalle}
                      </span>
                      <Chip nivel={p.nivel} className="mt-1">
                        {p.nivel === "danger" ? "Urgente" : "Atender"}
                      </Chip>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo="Pipeline">
          <div className="grid grid-cols-2 gap-2">
            <Metrica label="Oportunidades activas" valor={pipeline.oportunidadesActivas} />
            <Metrica label="Valor abierto" valor={dinero(pipeline.valorAbierto)} />
            <Metrica label="Ponderado" valor={dinero(pipeline.ponderado)} />
            <Metrica
              label="Cotizaciones abiertas"
              valor={pipeline.cotizacionesAbiertas}
              sub={dinero(pipeline.importeCotizado)}
            />
          </div>
        </Seccion>

        <Seccion titulo="Requieren atención">
          <div className="grid grid-cols-2 gap-2">
            <Metrica
              label="Activas sin próxima acción"
              valor={atencion.activasSinAccion.length}
              sub="Regla de próxima acción"
            />
            <Metrica label="Visitadas sin contacto" valor={atencion.visitadasSinContacto.length} />
            <Metrica
              label="Cotizaciones sin seguimiento"
              valor={atencion.cotizacionesVencidas.length}
            />
            <Metrica
              label="Oportunidades frías (7+ días)"
              valor={atencion.oportunidadesSinInteraccion.length}
            />
          </div>
          {atencion.activasSinAccion.length > 0 ? (
            <div className="flex items-start gap-2 rounded-lg border border-warn/40 bg-warn/10 p-3 text-xs">
              <AlertTriangle className="mt-0.5 size-4 text-warn" />
              <p>
                Hay {atencion.activasSinAccion.length} empresas activas sin siguiente acción
                definida. Programa una actividad para no perder el esfuerzo comercial.
              </p>
            </div>
          ) : null}
        </Seccion>

        <Seccion
          titulo={`Actividades vencidas (${vencidas.length})`}
          nota="Reprogramar o completar cuanto antes."
        >
          {vencidas.length === 0 ? (
            <Vacio>Sin actividades vencidas.</Vacio>
          ) : (
            <ul className="space-y-2">
              {vencidas.slice(0, 6).map((a) => (
                <FilaActividad key={a.id} actividad={a} />
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo={`Agenda de hoy (${hoy.length})`}>
          {hoy.length === 0 ? (
            <Vacio>No hay actividades programadas para hoy.</Vacio>
          ) : (
            <ul className="space-y-2">
              {hoy.map((a) => (
                <FilaActividad key={a.id} actividad={a} />
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo="Pipeline en construcción" nota="Prospección que aún no genera oportunidad.">
          <div className="grid grid-cols-2 gap-2">
            <Metrica
              label="Visitadas sin oportunidad"
              valor={construccion.visitadasSinOportunidad}
            />
            <Metrica label="Con contacto identificado" valor={construccion.conContactoIdentificado} />
            <Metrica label="Con seguimiento activo" valor={construccion.conSeguimientoActivo} />
            <Metrica label="Visitas últimos 30 días" valor={construccion.visitasMes} />
          </div>
        </Seccion>

        <Seccion titulo="Actividad del mes">
          <div className="grid grid-cols-2 gap-2">
            <Metrica label="Empresas nuevas" valor={mes.empresasNuevas} />
            <Metrica label="Visitas" valor={mes.visitas} sub={`${mes.empresasVisitadas} empresas`} />
            <Metrica label="Contactos obtenidos" valor={mes.contactosObtenidos} />
            <Metrica label="Cotizaciones enviadas" valor={mes.cotizacionesEnviadas} />
            <Metrica label="Pipeline generado" valor={dinero(mes.pipelineGenerado)} />
            <Metrica label="Ventas ganadas" valor={dinero(mes.valorGanado)} sub={`${mes.ventasGanadas} cierres`} />
          </div>
        </Seccion>
      </Contenido>
    </>
  );
}

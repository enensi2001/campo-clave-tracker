import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Seccion, Vacio } from "@/components/crm/ui-bits";
import { FilaActividad } from "@/components/crm/listas";
import { useDialogos } from "@/components/crm/dialogs";
import { useCrm } from "@/lib/crm/data";
import { hoyISO } from "@/lib/crm/format";
import { actividadHoy, actividadVencida } from "@/lib/crm/logic";

export const Route = createFileRoute("/_authenticated/actividades")({
  head: () => ({
    meta: [
      { title: "Actividades — CRM Industrial" },
      { name: "description", content: "Próximas acciones, actividades vencidas y agenda comercial." },
      { property: "og:title", content: "Actividades — CRM Industrial" },
      { property: "og:description", content: "Agenda de próximas acciones comerciales." },
    ],
  }),
  component: Actividades,
});

function Actividades() {
  const datos = useCrm();
  const dialogos = useDialogos();
  const hoy = hoyISO();

  const vencidas = datos.actividades.filter(actividadVencida);
  const deHoy = datos.actividades.filter(actividadHoy);
  const proximas = datos.actividades.filter(
    (a) => a.estado === "Pendiente" && a.fecha > hoy,
  );
  const cerradas = datos.actividades.filter((a) => a.estado !== "Pendiente");

  return (
    <>
      <Encabezado
        titulo="Actividades"
        subtitulo={`${vencidas.length} vencidas · ${deHoy.length} hoy`}
        accion={
          <Button size="sm" className="h-9" onClick={() => dialogos.actividad()}>
            Nueva
          </Button>
        }
      />
      <Contenido>
        <Seccion titulo={`Vencidas (${vencidas.length})`}>
          {vencidas.length === 0 ? (
            <Vacio>Sin actividades vencidas.</Vacio>
          ) : (
            <ul className="space-y-2">
              {vencidas.map((a) => (
                <FilaActividad key={a.id} actividad={a} />
              ))}
            </ul>
          )}
        </Seccion>
        <Seccion titulo={`Hoy (${deHoy.length})`}>
          {deHoy.length === 0 ? (
            <Vacio>Sin actividades para hoy.</Vacio>
          ) : (
            <ul className="space-y-2">
              {deHoy.map((a) => (
                <FilaActividad key={a.id} actividad={a} />
              ))}
            </ul>
          )}
        </Seccion>
        <Seccion titulo={`Próximas (${proximas.length})`}>
          {proximas.length === 0 ? (
            <Vacio>Sin actividades futuras programadas.</Vacio>
          ) : (
            <ul className="space-y-2">
              {proximas.map((a) => (
                <FilaActividad key={a.id} actividad={a} />
              ))}
            </ul>
          )}
        </Seccion>
        <Seccion titulo={`Historial (${cerradas.length})`}>
          {cerradas.length === 0 ? (
            <Vacio>Sin actividades cerradas.</Vacio>
          ) : (
            <ul className="space-y-2">
              {cerradas.slice(0, 20).map((a) => (
                <FilaActividad key={a.id} actividad={a} />
              ))}
            </ul>
          )}
        </Seccion>
      </Contenido>
    </>
  );
}

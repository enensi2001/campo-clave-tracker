import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Chip, Metrica, Seccion, SeguimientoChip, Vacio } from "@/components/crm/ui-bits";
import { useDialogos } from "@/components/crm/dialogs";
import { useCrm } from "@/lib/crm/data";
import { dinero } from "@/lib/crm/format";
import { calcularPipeline, esOportunidadAbierta } from "@/lib/crm/logic";
import { ETAPAS_OPORTUNIDAD } from "@/lib/crm/constants";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — CRM Industrial" },
      { name: "description", content: "Oportunidades por etapa con valor ponderado y seguimiento." },
      { property: "og:title", content: "Pipeline — CRM Industrial" },
      { property: "og:description", content: "Oportunidades por etapa y valor ponderado." },
    ],
  }),
  component: Pipeline,
});

function Pipeline() {
  const datos = useCrm();
  const dialogos = useDialogos();
  const resumen = calcularPipeline(datos);
  const etapas = ETAPAS_OPORTUNIDAD.map((e) => (typeof e === "string" ? e : e.valor ?? String(e)));

  return (
    <>
      <Encabezado
        titulo="Pipeline"
        subtitulo={`${resumen.oportunidadesActivas} oportunidades activas`}
        accion={
          <Button size="sm" className="h-9" onClick={() => dialogos.oportunidad()}>
            Nueva
          </Button>
        }
      />
      <Contenido>
        <div className="grid grid-cols-2 gap-2">
          <Metrica label="Valor abierto" valor={dinero(resumen.valorAbierto)} />
          <Metrica label="Ponderado" valor={dinero(resumen.ponderado)} />
        </div>
        {etapas.map((etapa) => {
          const items = datos.oportunidades.filter((o) => o.etapa === etapa);
          if (items.length === 0) return null;
          const total = items.reduce((s, o) => s + Number(o.valor_estimado ?? 0), 0);
          return (
            <Seccion key={etapa} titulo={`${etapa} (${items.length})`} nota={dinero(total)}>
              <ul className="space-y-2">
                {items.map((o) => {
                  const empresa = datos.empresas.find((e) => e.id === o.empresa_id);
                  return (
                    <li key={o.id} className="rounded-lg border bg-card p-3">
                      <p className="text-sm font-medium">{o.nombre_proyecto}</p>
                      {empresa ? (
                        <Link
                          to="/empresas/$id"
                          params={{ id: empresa.id }}
                          className="text-xs text-primary underline-offset-2 hover:underline"
                        >
                          {empresa.nombre}
                        </Link>
                      ) : null}
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Chip icono={false}>{dinero(o.valor_estimado, o.moneda)}</Chip>
                        <Chip nivel="info" icono={false}>{o.probabilidad}%</Chip>
                        {esOportunidadAbierta(o) ? (
                          <SeguimientoChip fecha={o.fecha_cierre_estimada} etiqueta="cierre" />
                        ) : null}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 flex-1"
                          onClick={() => dialogos.oportunidad(undefined, o)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          className="h-9 flex-1"
                          onClick={() =>
                            dialogos.cotizacion({ empresaId: o.empresa_id, oportunidadId: o.id })
                          }
                        >
                          Cotizar
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Seccion>
          );
        })}
        {datos.oportunidades.length === 0 ? <Vacio>Sin oportunidades registradas.</Vacio> : null}
      </Contenido>
    </>
  );
}

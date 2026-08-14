import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Chip, Seccion, SeguimientoChip, Vacio } from "@/components/crm/ui-bits";
import { useDialogos } from "@/components/crm/dialogs";
import { useCrm } from "@/lib/crm/data";
import { dinero, fechaCorta } from "@/lib/crm/format";
import { esCotizacionAbierta } from "@/lib/crm/logic";

export const Route = createFileRoute("/_authenticated/cotizaciones")({
  head: () => ({
    meta: [
      { title: "Cotizaciones — CRM Industrial" },
      { name: "description", content: "Cotizaciones enviadas, su estado y el próximo seguimiento." },
      { property: "og:title", content: "Cotizaciones — CRM Industrial" },
      { property: "og:description", content: "Control de cotizaciones y seguimientos." },
    ],
  }),
  component: Cotizaciones,
});

function Cotizaciones() {
  const datos = useCrm();
  const dialogos = useDialogos();
  const abiertas = datos.cotizaciones.filter(esCotizacionAbierta);
  const cerradas = datos.cotizaciones.filter((c) => !esCotizacionAbierta(c));

  const fila = (c: (typeof datos.cotizaciones)[number]) => {
    const empresa = datos.empresas.find((e) => e.id === c.empresa_id);
    return (
      <li key={c.id} className="rounded-lg border bg-card p-3">
        <p className="num text-sm font-semibold">{c.folio}</p>
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
          <Chip nivel="quote" icono={false}>
            {dinero(c.importe, c.moneda)}
          </Chip>
          <Chip icono={false}>{c.estado}</Chip>
          <SeguimientoChip fecha={c.fecha_proximo_seguimiento} />
        </div>
        <p className="num mt-1 text-xs text-muted-foreground">Emitida {fechaCorta(c.fecha)}</p>
        <Button
          size="sm"
          variant="outline"
          className="mt-2 h-9 w-full"
          onClick={() => dialogos.cotizacion(undefined, c)}
        >
          Editar
        </Button>
      </li>
    );
  };

  return (
    <>
      <Encabezado
        titulo="Cotizaciones"
        subtitulo={`${abiertas.length} abiertas`}
        accion={
          <Button size="sm" className="h-9" onClick={() => dialogos.cotizacion()}>
            Nueva
          </Button>
        }
      />
      <Contenido>
        <Seccion titulo={`Abiertas (${abiertas.length})`}>
          {abiertas.length === 0 ? (
            <Vacio>Sin cotizaciones abiertas.</Vacio>
          ) : (
            <ul className="space-y-2">{abiertas.map(fila)}</ul>
          )}
        </Seccion>
        <Seccion titulo={`Cerradas (${cerradas.length})`}>
          {cerradas.length === 0 ? (
            <Vacio>Sin cotizaciones cerradas.</Vacio>
          ) : (
            <ul className="space-y-2">{cerradas.map(fila)}</ul>
          )}
        </Seccion>
      </Contenido>
    </>
  );
}

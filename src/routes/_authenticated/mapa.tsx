import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { EstadoChip, Seccion, Vacio } from "@/components/crm/ui-bits";
import { useCrm } from "@/lib/crm/data";
import { mapsUrl } from "@/lib/crm/format";

export const Route = createFileRoute("/_authenticated/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de zona — CRM Industrial" },
      { name: "description", content: "Empresas con ubicación registrada para planear rutas de campo." },
      { property: "og:title", content: "Mapa de zona — CRM Industrial" },
      { property: "og:description", content: "Empresas georreferenciadas para rutas de campo." },
    ],
  }),
  component: Mapa,
});

function Mapa() {
  const datos = useCrm();
  const conUbicacion = datos.empresas.filter((e) => e.latitud != null && e.longitud != null);
  const sinUbicacion = datos.empresas.filter((e) => e.latitud == null || e.longitud == null);

  return (
    <>
      <Encabezado
        titulo="Mapa de zona"
        subtitulo={`${conUbicacion.length} empresas con ubicación`}
      />
      <Contenido>
        <Seccion titulo="Con coordenadas" nota="Abre la ubicación exacta en Google Maps.">
          {conUbicacion.length === 0 ? (
            <Vacio>Aún no capturas ubicaciones. Usa el botón de GPS al registrar una visita.</Vacio>
          ) : (
            <ul className="space-y-2">
              {conUbicacion.map((e) => (
                <li key={e.id} className="rounded-lg border bg-card p-3">
                  <p className="text-sm font-medium">{e.nombre}</p>
                  <p className="num text-xs text-muted-foreground">
                    {Number(e.latitud).toFixed(5)}, {Number(e.longitud).toFixed(5)}
                  </p>
                  <div className="mt-1">
                    <EstadoChip estado={e.estado_comercial} />
                  </div>
                  <Button size="sm" variant="secondary" className="mt-2 h-9 w-full" asChild>
                    <a href={mapsUrl(e)} target="_blank" rel="noreferrer">
                      Abrir en Maps
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
        <Seccion titulo={`Sin coordenadas (${sinUbicacion.length})`}>
          {sinUbicacion.length === 0 ? (
            <Vacio>Todas las empresas tienen ubicación.</Vacio>
          ) : (
            <ul className="space-y-2">
              {sinUbicacion.map((e) => (
                <li key={e.id} className="rounded-lg border bg-card p-3 text-sm">
                  {e.nombre}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {e.ciudad ?? "Sin ciudad"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </Contenido>
    </>
  );
}

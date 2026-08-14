import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Chip, EstadoChip, Seccion, SeguimientoChip, Vacio } from "@/components/crm/ui-bits";
import { FilaActividad } from "@/components/crm/listas";
import { useDialogos } from "@/components/crm/dialogs";
import { useCrm } from "@/lib/crm/data";
import { dinero, fechaCorta, mapsUrl } from "@/lib/crm/format";
import { historialEmpresa } from "@/lib/crm/logic";

export const Route = createFileRoute("/_authenticated/empresas/$id")({
  head: () => ({
    meta: [
      { title: "Ficha de empresa — CRM Industrial" },
      {
        name: "description",
        content: "Historial cronológico de visitas, contactos, oportunidades y cotizaciones.",
      },
      { property: "og:title", content: "Ficha de empresa — CRM Industrial" },
      { property: "og:description", content: "Historial comercial completo de la empresa." },
    ],
  }),
  component: Ficha,
});

function Ficha() {
  const { id } = Route.useParams();
  const datos = useCrm();
  const dialogos = useDialogos();
  const empresa = datos.empresas.find((e) => e.id === id);

  if (!empresa) {
    return (
      <>
        <Encabezado titulo="Empresa" />
        <Contenido>
          <Vacio>{datos.cargando ? "Cargando…" : "No encontramos esta empresa."}</Vacio>
        </Contenido>
      </>
    );
  }

  const contactos = datos.contactos.filter((c) => c.empresa_id === id);
  const visitas = datos.visitas.filter((v) => v.empresa_id === id);
  const oportunidades = datos.oportunidades.filter((o) => o.empresa_id === id);
  const cotizaciones = datos.cotizaciones.filter((c) => c.empresa_id === id);
  const actividades = datos.actividades.filter((a) => a.empresa_id === id);
  const historial = historialEmpresa(datos, id);

  return (
    <>
      <Encabezado
        titulo={empresa.nombre}
        subtitulo={[empresa.industria, empresa.ciudad].filter(Boolean).join(" · ")}
        accion={
          <Button size="sm" className="h-9" onClick={() => dialogos.empresa(empresa)}>
            Editar
          </Button>
        }
      />
      <Contenido>
        <div className="flex flex-wrap gap-1">
          <EstadoChip estado={empresa.estado_comercial} />
          <SeguimientoChip fecha={empresa.fecha_proxima_accion} />
          {empresa.origen ? <Chip icono={false}>{empresa.origen}</Chip> : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="h-11" asChild>
            <a href={mapsUrl(empresa)} target="_blank" rel="noreferrer">
              Ver en Maps
            </a>
          </Button>
          <Button className="h-11" onClick={() => dialogos.visita({ empresaId: empresa.id })}>
            Registrar visita
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={() => dialogos.contacto({ empresaId: empresa.id })}
          >
            Nuevo contacto
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={() => dialogos.oportunidad({ empresaId: empresa.id })}
          >
            Nueva oportunidad
          </Button>
        </div>

        {empresa.proxima_accion ? (
          <Seccion titulo="Próxima acción">
            <p className="rounded-lg border bg-card p-3 text-sm">
              {empresa.proxima_accion}
              <span className="num ml-2 text-xs text-muted-foreground">
                {fechaCorta(empresa.fecha_proxima_accion)}
              </span>
            </p>
          </Seccion>
        ) : null}

        <Seccion
          titulo={`Contactos (${contactos.length})`}
          accion={
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={() => dialogos.contacto({ empresaId: empresa.id })}
            >
              Agregar
            </Button>
          }
        >
          {contactos.length === 0 ? (
            <Vacio>Sin contactos. Registrar uno evita perder el esfuerzo de la visita.</Vacio>
          ) : (
            <ul className="space-y-2">
              {contactos.map((c) => (
                <li key={c.id} className="rounded-lg border bg-card p-3">
                  <button
                    className="w-full text-left"
                    onClick={() => dialogos.contacto(undefined, c)}
                  >
                    <p className="text-sm font-medium">
                      {c.nombre} {c.apellidos ?? ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[c.puesto, c.area, c.nivel_influencia].filter(Boolean).join(" · ")}
                    </p>
                    <p className="num text-xs text-muted-foreground">
                      {[c.telefono, c.email].filter(Boolean).join(" · ")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo={`Oportunidades (${oportunidades.length})`}>
          {oportunidades.length === 0 ? (
            <Vacio>Sin oportunidades registradas.</Vacio>
          ) : (
            <ul className="space-y-2">
              {oportunidades.map((o) => (
                <li key={o.id} className="rounded-lg border bg-card p-3">
                  <button
                    className="w-full text-left"
                    onClick={() => dialogos.oportunidad(undefined, o)}
                  >
                    <p className="text-sm font-medium">{o.nombre_proyecto}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.etapa} · {dinero(o.valor_estimado, o.moneda)} · {o.probabilidad}%
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo={`Cotizaciones (${cotizaciones.length})`}>
          {cotizaciones.length === 0 ? (
            <Vacio>Sin cotizaciones.</Vacio>
          ) : (
            <ul className="space-y-2">
              {cotizaciones.map((c) => (
                <li key={c.id} className="rounded-lg border bg-card p-3">
                  <button
                    className="w-full text-left"
                    onClick={() => dialogos.cotizacion(undefined, c)}
                  >
                    <p className="num text-sm font-medium">{c.folio}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.estado} · {dinero(c.importe, c.moneda)} · {fechaCorta(c.fecha)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo={`Actividades (${actividades.length})`}>
          {actividades.length === 0 ? (
            <Vacio>Sin actividades programadas.</Vacio>
          ) : (
            <ul className="space-y-2">
              {actividades.map((a) => (
                <FilaActividad key={a.id} actividad={a} />
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo={`Historial (${historial.length})`} nota={`${visitas.length} visitas`}>
          {historial.length === 0 ? (
            <Vacio>Sin eventos registrados.</Vacio>
          ) : (
            <ol className="space-y-2 border-l pl-3">
              {historial.map((ev) => (
                <li key={ev.id} className="relative rounded-lg border bg-card p-3">
                  <p className="num text-xs text-muted-foreground">{fechaCorta(ev.fecha)}</p>
                  <p className="text-sm font-medium">{ev.titulo}</p>
                  {ev.detalle ? (
                    <p className="text-xs text-muted-foreground">{ev.detalle}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </Seccion>
      </Contenido>
    </>
  );
}

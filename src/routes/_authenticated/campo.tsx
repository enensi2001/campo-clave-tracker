import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Campo, Seccion, Selector, Vacio } from "@/components/crm/ui-bits";
import { TarjetaEmpresa } from "@/components/crm/listas";
import { useDialogos } from "@/components/crm/dialogs";
import { useCrm } from "@/lib/crm/data";
import { diasDesde } from "@/lib/crm/format";
import { ESTADOS_COMERCIALES } from "@/lib/crm/constants";

export const Route = createFileRoute("/_authenticated/campo")({
  head: () => ({
    meta: [
      { title: "Modo campo — CRM Industrial" },
      {
        name: "description",
        content: "Prospección física: empresas por zona, visitas rápidas y captura desde el móvil.",
      },
      { property: "og:title", content: "Modo campo — CRM Industrial" },
      { property: "og:description", content: "Prospección física y captura rápida de visitas." },
    ],
  }),
  component: ModoCampo,
});

function ModoCampo() {
  const datos = useCrm();
  const dialogos = useDialogos();
  const [busqueda, setBusqueda] = useState("");
  const [ciudad, setCiudad] = useState<string | null>(null);
  const [estado, setEstado] = useState<string | null>(null);

  const ciudades = [...new Set(datos.empresas.map((e) => e.ciudad).filter(Boolean))] as string[];

  const lista = datos.empresas
    .filter((e) => (ciudad ? e.ciudad === ciudad : true))
    .filter((e) => (estado ? e.estado_comercial === estado : true))
    .filter((e) =>
      busqueda.trim()
        ? [e.nombre, e.zona_industrial, e.colonia, e.ciudad]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(busqueda.trim().toLowerCase())
        : true,
    )
    .sort((a, b) => (diasDesde(b.ultima_interaccion) ?? 999) - (diasDesde(a.ultima_interaccion) ?? 999));

  return (
    <>
      <Encabezado
        titulo="Modo campo"
        subtitulo="Prospección física y captura rápida"
        accion={
          <Button size="sm" className="h-9" onClick={() => dialogos.empresa()}>
            Nueva empresa
          </Button>
        }
      />
      <Contenido>
        <Seccion titulo="Filtros de ruta">
          <div className="space-y-2">
            <Input
              className="h-11"
              placeholder="Buscar por nombre, zona o colonia"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Campo label="Ciudad">
                <Selector
                  valor={ciudad}
                  onChange={setCiudad}
                  opciones={ciudades}
                  permitirVacio
                  etiquetaVacio="Todas"
                  placeholder="Todas"
                />
              </Campo>
              <Campo label="Estado">
                <Selector
                  valor={estado}
                  onChange={setEstado}
                  opciones={ESTADOS_COMERCIALES}
                  permitirVacio
                  etiquetaVacio="Todos"
                  placeholder="Todos"
                />
              </Campo>
            </div>
          </div>
        </Seccion>

        <Seccion
          titulo={`Empresas por visitar (${lista.length})`}
          nota="Ordenadas por tiempo sin interacción."
        >
          {lista.length === 0 ? (
            <Vacio>No hay empresas con esos filtros. Registra una nueva desde el botón +.</Vacio>
          ) : (
            <ul className="space-y-2">
              {lista.map((e) => (
                <TarjetaEmpresa key={e.id} empresa={e} modoCampo />
              ))}
            </ul>
          )}
        </Seccion>
      </Contenido>
    </>
  );
}

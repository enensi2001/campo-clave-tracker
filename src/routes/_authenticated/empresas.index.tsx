import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Campo, Seccion, Selector, Vacio } from "@/components/crm/ui-bits";
import { TarjetaEmpresa } from "@/components/crm/listas";
import { useDialogos } from "@/components/crm/dialogs";
import { useCrm } from "@/lib/crm/data";
import { ESTADOS_COMERCIALES } from "@/lib/crm/constants";

export const Route = createFileRoute("/_authenticated/empresas/")({
  head: () => ({
    meta: [
      { title: "Empresas — CRM Industrial" },
      {
        name: "description",
        content: "Directorio de empresas prospectadas con estado comercial y próxima acción.",
      },
      { property: "og:title", content: "Empresas — CRM Industrial" },
      { property: "og:description", content: "Directorio de empresas y su estado comercial." },
    ],
  }),
  component: Empresas,
});

function Empresas() {
  const datos = useCrm();
  const dialogos = useDialogos();
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<string | null>(null);

  const lista = datos.empresas
    .filter((e) => (estado ? e.estado_comercial === estado : true))
    .filter((e) =>
      busqueda.trim() ? e.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()) : true,
    );

  return (
    <>
      <Encabezado
        titulo="Empresas"
        subtitulo={`${datos.empresas.length} registradas`}
        accion={
          <Button size="sm" className="h-9" onClick={() => dialogos.empresa()}>
            Nueva
          </Button>
        }
      />
      <Contenido>
        <div className="space-y-2">
          <Input
            className="h-11"
            placeholder="Buscar empresa"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Campo label="Estado comercial">
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
        <Seccion titulo={`Resultados (${lista.length})`}>
          {lista.length === 0 ? (
            <Vacio>Sin empresas con esos filtros.</Vacio>
          ) : (
            <ul className="space-y-2">
              {lista.map((e) => (
                <TarjetaEmpresa key={e.id} empresa={e} />
              ))}
            </ul>
          )}
        </Seccion>
      </Contenido>
    </>
  );
}

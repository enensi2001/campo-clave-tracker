import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Seccion, Vacio } from "@/components/crm/ui-bits";
import { useDialogos } from "@/components/crm/dialogs";
import { useCrm } from "@/lib/crm/data";

export const Route = createFileRoute("/_authenticated/contactos")({
  head: () => ({
    meta: [
      { title: "Contactos — CRM Industrial" },
      { name: "description", content: "Contactos técnicos y de compras por empresa industrial." },
      { property: "og:title", content: "Contactos — CRM Industrial" },
      { property: "og:description", content: "Directorio de contactos por empresa." },
    ],
  }),
  component: Contactos,
});

function Contactos() {
  const datos = useCrm();
  const dialogos = useDialogos();
  const [busqueda, setBusqueda] = useState("");

  const lista = datos.contactos.filter((c) =>
    busqueda.trim()
      ? `${c.nombre} ${c.apellidos ?? ""} ${c.puesto ?? ""}`
          .toLowerCase()
          .includes(busqueda.trim().toLowerCase())
      : true,
  );

  return (
    <>
      <Encabezado
        titulo="Contactos"
        subtitulo={`${datos.contactos.length} registrados`}
        accion={
          <Button size="sm" className="h-9" onClick={() => dialogos.contacto()}>
            Nuevo
          </Button>
        }
      />
      <Contenido>
        <Input
          className="h-11"
          placeholder="Buscar contacto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Seccion titulo={`Resultados (${lista.length})`}>
          {lista.length === 0 ? (
            <Vacio>Sin contactos.</Vacio>
          ) : (
            <ul className="space-y-2">
              {lista.map((c) => {
                const empresa = datos.empresas.find((e) => e.id === c.empresa_id);
                return (
                  <li key={c.id} className="rounded-lg border bg-card p-3">
                    <p className="text-sm font-medium">
                      {c.nombre} {c.apellidos ?? ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[c.puesto, c.area].filter(Boolean).join(" · ")}
                    </p>
                    {empresa ? (
                      <Link
                        to="/empresas/$id"
                        params={{ id: empresa.id }}
                        className="text-xs text-primary underline-offset-2 hover:underline"
                      >
                        {empresa.nombre}
                      </Link>
                    ) : null}
                    <div className="mt-2 flex gap-2">
                      {c.telefono ? (
                        <Button size="sm" variant="secondary" className="h-9 flex-1" asChild>
                          <a href={`tel:${c.telefono}`}>Llamar</a>
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 flex-1"
                        onClick={() => dialogos.contacto(undefined, c)}
                      >
                        Editar
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Seccion>
      </Contenido>
    </>
  );
}

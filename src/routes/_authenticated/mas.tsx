import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Seccion } from "@/components/crm/ui-bits";
import { useCrm } from "@/lib/crm/data";
import { supabase } from "@/integrations/supabase/client";

const ENLACES = [
  { to: "/contactos", label: "Contactos" },
  { to: "/cotizaciones", label: "Cotizaciones" },
  { to: "/actividades", label: "Actividades" },
  { to: "/analitica", label: "Analítica" },
  { to: "/mapa", label: "Mapa de zona" },
] as const;

export const Route = createFileRoute("/_authenticated/mas")({
  head: () => ({
    meta: [
      { title: "Más — CRM Industrial" },
      { name: "description", content: "Secciones adicionales, resumen de datos y cierre de sesión." },
      { property: "og:title", content: "Más — CRM Industrial" },
      { property: "og:description", content: "Secciones adicionales del CRM industrial." },
    ],
  }),
  component: Mas,
});

function Mas() {
  const datos = useCrm();
  const router = useRouter();

  return (
    <>
      <Encabezado titulo="Más" subtitulo="Secciones y cuenta" />
      <Contenido>
        <Seccion titulo="Secciones">
          <ul className="space-y-2">
            {ENLACES.map((e) => (
              <li key={e.to}>
                <Link
                  to={e.to}
                  className="block rounded-lg border bg-card p-3 text-sm font-medium"
                >
                  {e.label}
                </Link>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Resumen de datos">
          <ul className="num space-y-1 rounded-lg border bg-card p-3 text-sm">
            <li>{datos.empresas.length} empresas</li>
            <li>{datos.contactos.length} contactos</li>
            <li>{datos.visitas.length} visitas</li>
            <li>{datos.oportunidades.length} oportunidades</li>
            <li>{datos.cotizaciones.length} cotizaciones</li>
            <li>{datos.actividades.length} actividades</li>
          </ul>
        </Seccion>

        <Seccion titulo="Cuenta" nota="Zona horaria America/Mexico_City · fechas DD/MM/AAAA">
          <Button
            variant="outline"
            className="h-11 w-full"
            onClick={async () => {
              await supabase.auth.signOut();
              void router.navigate({ to: "/auth" });
            }}
          >
            Cerrar sesión
          </Button>
        </Seccion>
      </Contenido>
    </>
  );
}

import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Seccion } from "@/components/crm/ui-bits";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SeccionExportar } from "@/components/crm/exportar-seccion";
import { eliminarDatosDemo, esDemo, useCrm, useInvalidarCrm } from "@/lib/crm/data";
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
  const invalidar = useInvalidarCrm();
  const [confirmar, setConfirmar] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const demo = {
    empresas: datos.empresas.filter(esDemo).length,
    contactos: datos.contactos.filter(esDemo).length,
    visitas: datos.visitas.filter(esDemo).length,
    oportunidades: datos.oportunidades.filter(esDemo).length,
    cotizaciones: datos.cotizaciones.filter(esDemo).length,
    actividades: datos.actividades.filter(esDemo).length,
  };
  const totalDemo = Object.values(demo).reduce((a, b) => a + b, 0);
  const borrarDemo = async () => {
    setBorrando(true);
    try {
      await eliminarDatosDemo();
      await invalidar();
      toast.success("Datos de demostración eliminados.");
      setConfirmar(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudieron eliminar los datos de demostración.");
    } finally {
      setBorrando(false);
    }
  };

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

        <SeccionExportar />

        <Seccion titulo="Configuración" nota="Solo registros de ejemplo sin dueño">
          <Button
            variant="destructive"
            className="h-11 w-full"
            disabled={totalDemo === 0}
            onClick={() => setConfirmar(true)}
          >
            Eliminar datos de demostración ({totalDemo})
          </Button>
          <AlertDialog open={confirmar} onOpenChange={(o) => !borrando && setConfirmar(o)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar datos de demostración?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminarán definitivamente {demo.empresas} empresas, {demo.contactos} contactos,{" "}
                  {demo.visitas} visitas, {demo.oportunidades} oportunidades, {demo.cotizaciones}{" "}
                  cotizaciones y {demo.actividades} actividades de ejemplo. Tus registros no se tocan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={borrando}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={borrando}
                  onClick={(e) => {
                    e.preventDefault();
                    void borrarDemo();
                  }}
                >
                  Eliminar definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

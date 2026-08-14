import type { ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  FileText,
  Home,
  LogOut,
  Map,
  MoreHorizontal,
  Plus,
  Target,
  Truck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useDialogos } from "@/components/crm/dialogs";

const PRINCIPALES = [
  { to: "/inicio", label: "Inicio", icono: Home },
  { to: "/campo", label: "Campo", icono: Truck },
  { to: "/empresas", label: "Empresas", icono: Building2 },
  { to: "/pipeline", label: "Pipeline", icono: Target },
] as const;

const SECUNDARIOS = [
  { to: "/contactos", label: "Contactos", icono: Users },
  { to: "/cotizaciones", label: "Cotizaciones", icono: FileText },
  { to: "/actividades", label: "Actividades", icono: CalendarCheck },
  { to: "/analitica", label: "Analítica", icono: BarChart3 },
  { to: "/mapa", label: "Mapa", icono: Map },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const dialogos = useDialogos();
  const router = useRouter();

  const salir = async () => {
    await supabase.auth.signOut();
    void router.navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar p-3 text-sidebar-foreground md:flex">
        <div className="px-2 py-3">
          <p className="text-sm font-semibold tracking-tight">CRM Industrial</p>
          <p className="text-xs text-sidebar-foreground/70">Prospección técnica B2B</p>
        </div>
        <nav className="mt-2 flex-1 space-y-1">
          {[...PRINCIPALES, ...SECUNDARIOS].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            >
              <item.icono className="size-4" />
              {item.label}
            </Link>
          ))}
          <Link
            to="/mas"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          >
            <MoreHorizontal className="size-4" />
            Configuración
          </Link>
        </nav>
        <Button
          variant="ghost"
          className="justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={salir}
        >
          <LogOut className="size-4" />
          Salir
        </Button>
      </aside>

      <main className="min-w-0 flex-1 pb-24 md:pb-8">{children}</main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card/95 backdrop-blur md:hidden">
        {PRINCIPALES.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground"
            activeProps={{ className: "text-primary font-medium" }}
          >
            <item.icono className="size-5" />
            {item.label}
          </Link>
        ))}
        <Link
          to="/mas"
          className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground"
          activeProps={{ className: "text-primary font-medium" }}
        >
          <MoreHorizontal className="size-5" />
          Más
        </Link>
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "fixed bottom-20 right-4 z-50 size-14 rounded-full shadow-lg md:bottom-6",
              "bg-accent text-accent-foreground hover:bg-accent/90",
            )}
            aria-label="Acciones rápidas"
          >
            <Plus className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          <DropdownMenuItem onSelect={() => dialogos.visita()}>Registrar visita</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => dialogos.empresa()}>Nueva empresa</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => dialogos.actividad()}>Nueva actividad</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => dialogos.oportunidad()}>
            Nueva oportunidad
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => dialogos.cotizacion()}>
            Nueva cotización
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function Encabezado({
  titulo,
  subtitulo,
  accion,
}: {
  titulo: string;
  subtitulo?: string;
  accion?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 px-4 py-3 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold leading-tight">{titulo}</h1>
          {subtitulo ? (
            <p className="truncate text-xs text-muted-foreground">{subtitulo}</p>
          ) : null}
        </div>
        {accion}
      </div>
    </header>
  );
}

export function Contenido({ children }: { children: ReactNode }) {
  return <div className="space-y-6 px-4 py-4">{children}</div>;
}

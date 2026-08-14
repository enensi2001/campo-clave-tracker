import { Link } from "@tanstack/react-router";
import { Check, MapPin, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip, EstadoChip, SeguimientoChip } from "@/components/crm/ui-bits";
import { useDialogos } from "@/components/crm/dialogs";
import { useCrm, type Actividad, type Empresa } from "@/lib/crm/data";
import { diasDesde, fechaCorta, hora, mapsUrl } from "@/lib/crm/format";
import { contactoPrincipal, ultimaVisita, type Semaforo } from "@/lib/crm/logic";

const NIVEL_PRIORIDAD: Record<string, Semaforo> = {
  Alta: "danger",
  Media: "warn",
  Baja: "idle",
};

export function FilaActividad({ actividad }: { actividad: Actividad }) {
  const { empresas } = useCrm();
  const dialogos = useDialogos();
  const empresa = empresas.find((e) => e.id === actividad.empresa_id);

  return (
    <li className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium">
            {actividad.tipo}
            {actividad.hora ? (
              <span className="num ml-2 text-xs text-muted-foreground">
                {hora(actividad.hora)}
              </span>
            ) : null}
          </p>
          {empresa ? (
            <Link
              to="/empresas/$id"
              params={{ id: empresa.id }}
              className="block truncate text-xs text-primary underline-offset-2 hover:underline"
            >
              {empresa.nombre}
            </Link>
          ) : (
            <p className="text-xs text-muted-foreground">Sin empresa</p>
          )}
          {actividad.objetivo ? (
            <p className="text-xs text-muted-foreground">{actividad.objetivo}</p>
          ) : null}
          <div className="flex flex-wrap gap-1 pt-0.5">
            <Chip nivel={NIVEL_PRIORIDAD[actividad.prioridad] ?? "idle"} icono={false}>
              {actividad.prioridad}
            </Chip>
            <SeguimientoChip fecha={actividad.fecha} etiqueta="fecha" />
            {actividad.estado !== "Pendiente" ? (
              <Chip nivel={actividad.estado === "Completada" ? "ok" : "idle"}>
                {actividad.estado}
              </Chip>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          {actividad.estado === "Pendiente" ? (
            <Button
              size="sm"
              className="h-9"
              onClick={() => dialogos.completar(actividad)}
              aria-label="Completar actividad"
            >
              <Check className="size-4" /> Completar
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            onClick={() => dialogos.actividad(undefined, actividad)}
          >
            <Pencil className="size-4" /> Editar
          </Button>
        </div>
      </div>
    </li>
  );
}

export function TarjetaEmpresa({
  empresa,
  modoCampo = false,
}: {
  empresa: Empresa;
  modoCampo?: boolean;
}) {
  const datos = useCrm();
  const dialogos = useDialogos();
  const contacto = contactoPrincipal(datos, empresa.id);
  const visita = ultimaVisita(datos, empresa.id);
  const diasVisita = visita ? diasDesde(visita.fecha) : null;
  const diasInteraccion = diasDesde(empresa.ultima_interaccion);

  return (
    <li className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            to="/empresas/$id"
            params={{ id: empresa.id }}
            className="block truncate text-sm font-semibold underline-offset-2 hover:underline"
          >
            {empresa.nombre}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {[empresa.industria, empresa.ciudad].filter(Boolean).join(" · ") || "Sin industria"}
          </p>
          <div className="flex flex-wrap gap-1 pt-0.5">
            <EstadoChip estado={empresa.estado_comercial} />
            <SeguimientoChip fecha={empresa.fecha_proxima_accion} />
          </div>
          <p className="text-xs text-muted-foreground">
            {contacto
              ? `Contacto: ${contacto.nombre} ${contacto.apellidos ?? ""}`.trim()
              : "Sin contacto registrado"}
          </p>
          <p className="num text-xs text-muted-foreground">
            {modoCampo
              ? diasVisita != null
                ? `${diasVisita} días desde última visita`
                : "Sin visitas registradas"
              : diasInteraccion != null
                ? `${diasInteraccion} días sin interacción · ${fechaCorta(empresa.ultima_interaccion)}`
                : "Sin interacción registrada"}
          </p>
          {empresa.proxima_accion ? (
            <p className="text-xs">
              <span className="text-muted-foreground">Próxima acción: </span>
              {empresa.proxima_accion}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="h-10 flex-1"
          asChild
        >
          <a href={mapsUrl(empresa)} target="_blank" rel="noreferrer">
            <MapPin className="size-4" /> Maps
          </a>
        </Button>
        <Button
          size="sm"
          className="h-10 flex-[2]"
          onClick={() => dialogos.visita({ empresaId: empresa.id })}
        >
          <Plus className="size-4" /> Registrar visita
        </Button>
      </div>
    </li>
  );
}

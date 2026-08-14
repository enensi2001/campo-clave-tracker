import type { ReactNode } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleSlash,
  FileText,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { diasDesde, fechaCorta } from "@/lib/crm/format";
import { semaforoEstadoEmpresa, type Semaforo } from "@/lib/crm/logic";

const CLASES: Record<Semaforo, string> = {
  ok: "bg-ok text-ok-foreground",
  warn: "bg-warn text-warn-foreground",
  danger: "bg-danger text-danger-foreground",
  info: "bg-info text-info-foreground",
  quote: "bg-quote text-quote-foreground",
  idle: "bg-idle text-idle-foreground",
};

const ICONOS: Record<Semaforo, typeof Target> = {
  ok: CheckCircle2,
  warn: CalendarClock,
  danger: AlertTriangle,
  info: Target,
  quote: FileText,
  idle: CircleSlash,
};

export function Chip({
  nivel = "idle",
  children,
  icono = true,
  className,
}: {
  nivel?: Semaforo;
  children: ReactNode;
  icono?: boolean;
  className?: string;
}) {
  const Icono = ICONOS[nivel];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight",
        CLASES[nivel],
        className,
      )}
    >
      {icono ? <Icono className="size-3 shrink-0" aria-hidden /> : null}
      {children}
    </span>
  );
}

export function EstadoChip({ estado }: { estado: string }) {
  return <Chip nivel={semaforoEstadoEmpresa(estado)}>{estado}</Chip>;
}

export function SeguimientoChip({
  fecha,
  etiqueta = "Próxima acción",
}: {
  fecha?: string | null;
  etiqueta?: string;
}) {
  if (!fecha) return <Chip nivel="danger">Sin {etiqueta.toLowerCase()}</Chip>;
  const d = diasDesde(fecha);
  if (d != null && d > 0) return <Chip nivel="danger">Vencido {d} d — {fechaCorta(fecha)}</Chip>;
  if (d === 0) return <Chip nivel="warn">Hoy — {fechaCorta(fecha)}</Chip>;
  if (d != null && d >= -3) return <Chip nivel="warn">En {Math.abs(d)} d — {fechaCorta(fecha)}</Chip>;
  return <Chip nivel="ok">{fechaCorta(fecha)}</Chip>;
}

export function Campo({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const VACIO = "__vacio__";

export function Selector({
  valor,
  onChange,
  opciones,
  placeholder = "Selecciona",
  permitirVacio = false,
  etiquetaVacio = "Sin especificar",
}: {
  valor?: string | null;
  onChange: (valor: string | null) => void;
  opciones: readonly { valor: string; etiqueta: string }[] | readonly string[];
  placeholder?: string;
  permitirVacio?: boolean;
  etiquetaVacio?: string;
}) {
  const items = opciones.map((o) =>
    typeof o === "string" ? { valor: o, etiqueta: o } : o,
  );
  return (
    <Select
      value={valor ?? VACIO}
      onValueChange={(v) => onChange(v === VACIO ? null : v)}
    >
      <SelectTrigger className="h-11 w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {permitirVacio ? <SelectItem value={VACIO}>{etiquetaVacio}</SelectItem> : null}
        {items.map((o) => (
          <SelectItem key={o.valor} value={o.valor}>
            {o.etiqueta}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Seccion({
  titulo,
  accion,
  children,
  nota,
}: {
  titulo: string;
  accion?: ReactNode;
  children: ReactNode;
  nota?: string;
}) {
  return (
    <section className="space-y-2">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {titulo}
        </h2>
        {accion}
      </header>
      {nota ? <p className="text-xs text-muted-foreground">{nota}</p> : null}
      {children}
    </section>
  );
}

export function Metrica({
  label,
  valor,
  sub,
}: {
  label: string;
  valor: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="num mt-1 text-lg font-semibold leading-none">{valor}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed bg-surface px-3 py-4 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

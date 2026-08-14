export const TZ = "America/Mexico_City";

/** Fecha de hoy (YYYY-MM-DD) en zona America/Mexico_City. */
export function hoyISO(): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return partes;
}

export function horaActual(): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function sumarDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(Date.UTC(y ?? 2000, (m ?? 1) - 1, d ?? 1));
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

/** DD/MM/YYYY */
export function fechaCorta(iso?: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return "—";
  return `${d}/${m}/${y}`;
}

export function hora(valor?: string | null): string {
  if (!valor) return "";
  return valor.slice(0, 5);
}

export function diasDesde(iso?: string | null): number | null {
  if (!iso) return null;
  return diasEntre(iso, hoyISO());
}

export function diasHasta(iso?: string | null): number | null {
  if (!iso) return null;
  return diasEntre(hoyISO(), iso);
}

function diasEntre(desde: string, hasta: string): number {
  const a = Date.parse(`${desde.slice(0, 10)}T00:00:00Z`);
  const b = Date.parse(`${hasta.slice(0, 10)}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}

export function dinero(valor?: number | null, moneda: string = "MXN"): string {
  const n = valor ?? 0;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(n);
}

export function numero(valor?: number | null): string {
  return new Intl.NumberFormat("es-MX").format(valor ?? 0);
}

export function mapsUrl(opts: {
  latitud?: number | null;
  longitud?: number | null;
  direccion?: string | null;
  ciudad?: string | null;
  nombre?: string | null;
}): string {
  if (opts.latitud != null && opts.longitud != null) {
    return `https://www.google.com/maps/search/?api=1&query=${opts.latitud},${opts.longitud}`;
  }
  const q = [opts.nombre, opts.direccion, opts.ciudad].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || "México")}`;
}

export function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(sa de cv|s a de c v|sapi de cv|srl|s de rl|sa|cv|inc|llc|de|del|la|el)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function soloDigitos(valor?: string | null): string {
  return (valor ?? "").replace(/\D/g, "");
}

export function dominio(url?: string | null): string {
  if (!url) return "";
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

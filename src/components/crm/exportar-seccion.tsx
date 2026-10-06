import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Campo, Seccion, Selector } from "@/components/crm/ui-bits";
import { useCrm } from "@/lib/crm/data";
import { ATAJOS, generarExcel, rangoDeAtajo, type ClaveAtajo, type Rango } from "@/lib/crm/exportar";

export function SeccionExportar() {
  const datos = useCrm();
  const [atajo, setAtajo] = useState<ClaveAtajo>(ATAJOS[0]!.valor);
  const [rango, setRango] = useState<Rango>(() => rangoDeAtajo(ATAJOS[0]!.valor));
  const [generando, setGenerando] = useState(false);

  const cambiarFecha = (k: keyof Rango, v: string) => {
    setAtajo("personalizado" as ClaveAtajo);
    setRango((r) => ({ ...r, [k]: v }));
  };

  const generar = async () => {
    if (!rango.desde || !rango.hasta || rango.desde > rango.hasta) {
      toast.error("La fecha inicial debe ser anterior o igual a la final.");
      return;
    }
    setGenerando(true);
    try {
      const total = await generarExcel(datos, rango);
      if (total === 0) toast.info("No hubo registros en el periodo. Se generó el libro vacío.");
      else toast.success(`Excel generado con ${total} registros.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo generar el Excel.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Seccion titulo="Exportar información" nota="Fechas inclusivas">
      <div className="space-y-3 rounded-lg border bg-card p-3">
        <Campo label="Periodo">
          <Selector
            valor={atajo}
            onChange={(v) => {
              const k = (v ?? ATAJOS[0]!.valor) as ClaveAtajo;
              setAtajo(k);
              setRango((r) => rangoDeAtajo(k, r));
            }}
            opciones={ATAJOS}
          />
        </Campo>
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Fecha inicial">
            <Input type="date" className="h-11" value={rango.desde} onChange={(e) => cambiarFecha("desde", e.target.value)} />
          </Campo>
          <Campo label="Fecha final">
            <Input type="date" className="h-11" value={rango.hasta} onChange={(e) => cambiarFecha("hasta", e.target.value)} />
          </Campo>
        </div>
        <Button className="h-11 w-full" onClick={generar} disabled={generando}>
          {generando ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          Generar Excel
        </Button>
      </div>
    </Seccion>
  );
}

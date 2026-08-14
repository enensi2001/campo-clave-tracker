import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Contenido, Encabezado } from "@/components/crm/app-shell";
import { Campo, Metrica, Seccion, Selector } from "@/components/crm/ui-bits";
import { useCrm } from "@/lib/crm/data";
import { dinero } from "@/lib/crm/format";
import { calcularActividadPeriodo, rangoDesde } from "@/lib/crm/logic";

const PERIODOS = [
  { valor: "semana", etiqueta: "Última semana" },
  { valor: "mes", etiqueta: "Últimos 30 días" },
  { valor: "trimestre", etiqueta: "Último trimestre" },
  { valor: "anio", etiqueta: "Último año" },
] as const;

export const Route = createFileRoute("/_authenticated/analitica")({
  head: () => ({
    meta: [
      { title: "Analítica — CRM Industrial" },
      { name: "description", content: "Indicadores de prospección, conversión y pipeline generado." },
      { property: "og:title", content: "Analítica — CRM Industrial" },
      { property: "og:description", content: "Indicadores de esfuerzo y resultado comercial." },
    ],
  }),
  component: Analitica,
});

function Analitica() {
  const datos = useCrm();
  const [periodo, setPeriodo] = useState<"semana" | "mes" | "trimestre" | "anio">("mes");
  const m = calcularActividadPeriodo(datos, rangoDesde(periodo));
  const conversion = m.visitas > 0 ? Math.round((m.oportunidadesCreadas / m.visitas) * 100) : 0;

  return (
    <>
      <Encabezado titulo="Analítica" subtitulo="Esfuerzo comercial y resultados" />
      <Contenido>
        <Campo label="Periodo">
          <Selector
            valor={periodo}
            onChange={(v) => setPeriodo((v as typeof periodo) ?? "mes")}
            opciones={PERIODOS}
          />
        </Campo>
        <Seccion titulo="Esfuerzo">
          <div className="grid grid-cols-2 gap-2">
            <Metrica label="Empresas nuevas" valor={m.empresasNuevas} />
            <Metrica label="Visitas" valor={m.visitas} sub={`${m.empresasVisitadas} empresas`} />
            <Metrica label="Contactos obtenidos" valor={m.contactosObtenidos} />
            <Metrica label="Actividades completadas" valor={m.actividadesCompletadas} />
          </div>
        </Seccion>
        <Seccion titulo="Resultado">
          <div className="grid grid-cols-2 gap-2">
            <Metrica label="Oportunidades creadas" valor={m.oportunidadesCreadas} />
            <Metrica label="Cotizaciones enviadas" valor={m.cotizacionesEnviadas} />
            <Metrica label="Pipeline generado" valor={dinero(m.pipelineGenerado)} />
            <Metrica label="Visita → oportunidad" valor={`${conversion}%`} />
            <Metrica label="Valor ganado" valor={dinero(m.valorGanado)} sub={`${m.ventasGanadas} cierres`} />
            <Metrica label="Valor perdido" valor={dinero(m.valorPerdido)} />
          </div>
        </Seccion>
      </Contenido>
    </>
  );
}

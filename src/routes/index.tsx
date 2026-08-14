import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/inicio" });
  },
  head: () => ({
    meta: [
      { title: "CRM Industrial — Prospección técnica B2B" },
      {
        name: "description",
        content:
          "CRM móvil para ventas técnicas industriales: prospección en campo, visitas, oportunidades y cotizaciones.",
      },
    ],
  }),
});

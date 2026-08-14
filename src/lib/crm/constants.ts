export const ORIGENES = [
  "Google Maps",
  "Recorrido físico",
  "Recomendación",
  "Parque industrial",
  "Directorio",
  "Internet",
  "Otro",
] as const;

export const ESTADOS_COMERCIALES = [
  "Pendiente de visitar",
  "Visitada sin contacto",
  "Contacto identificado",
  "Contactada",
  "Interesada",
  "Oportunidad activa",
  "Cotización activa",
  "Cliente",
  "Prospecto dormido",
  "Descartada",
] as const;

export const AREAS = [
  "Mantenimiento",
  "Ingeniería",
  "Proyectos",
  "Compras",
  "Producción",
  "Calidad",
  "Servicios",
  "Seguridad",
  "Dirección",
  "Otra",
] as const;

export const NIVELES_CONTACTO = [
  "A — Tomador de decisión",
  "B — Influenciador técnico",
  "C — Usuario",
  "D — Compras",
  "E — Contacto inicial",
] as const;

export const TIPOS_VISITA = [
  "Primera visita",
  "Seguimiento presencial",
  "Obtener contacto",
  "Visita comercial",
  "Visita técnica",
  "Postventa",
] as const;

export const RESULTADOS_VISITA = [
  "Sin acceso",
  "Solo seguridad",
  "Carta de presentación entregada",
  "Tarjeta entregada",
  "Contacto no disponible",
  "Nombre de contacto obtenido",
  "Correo obtenido",
  "Teléfono obtenido",
  "Hablé con mantenimiento",
  "Hablé con ingeniería",
  "Hablé con compras",
  "Solicitaron regresar",
  "Solicitaron información",
  "Solicitaron cotización",
  "Solicitaron visita técnica",
  "Necesidad detectada",
  "Sin interés actual",
  "Empresa no relevante",
  "Otro",
] as const;

export const ETAPAS_OPORTUNIDAD = [
  "Necesidad detectada",
  "Levantamiento pendiente",
  "Visita técnica",
  "Ingeniería",
  "Cotización",
  "En revisión",
  "Negociación",
  "Esperando OC",
  "Ganada",
  "Perdida",
  "Detenida",
] as const;

export const ETAPAS_CERRADAS = ["Ganada", "Perdida", "Detenida"] as const;

export const ESTADOS_COTIZACION = [
  "Preparación",
  "Enviada",
  "En revisión",
  "Modificación solicitada",
  "Negociación",
  "Esperando OC",
  "Ganada",
  "Perdida",
  "Detenida",
] as const;

export const ESTADOS_COTIZACION_ABIERTA = [
  "Preparación",
  "Enviada",
  "En revisión",
  "Modificación solicitada",
  "Negociación",
  "Esperando OC",
] as const;

export const TIPOS_ACTIVIDAD = [
  "Prospectar",
  "Visitar empresa",
  "Llamar",
  "WhatsApp",
  "Correo",
  "Enviar presentación",
  "Seguimiento",
  "Visita técnica",
  "Levantamiento",
  "Preparar cotización",
  "Enviar cotización",
  "Seguimiento de cotización",
  "Reunión",
  "Negociación",
  "Postventa",
] as const;

export const ESTADOS_ACTIVIDAD = ["Pendiente", "Completada", "Vencida", "Cancelada"] as const;

export const PRIORIDADES = ["Alta", "Media", "Baja"] as const;

export const MONEDAS = ["MXN", "USD"] as const;

/** Sugerencias determinísticas por resultado de visita (regla → actividad + días). */
export const SUGERENCIAS_POR_RESULTADO: Record<
  string,
  { tipo: string; objetivo: string; dias: number; prioridad: string } | undefined
> = {
  "Carta de presentación entregada": {
    tipo: "Visitar empresa",
    objetivo: "Volver a visitar para obtener contacto",
    dias: 7,
    prioridad: "Media",
  },
  "Solo seguridad": {
    tipo: "Visitar empresa",
    objetivo: "Volver a visitar para obtener contacto",
    dias: 7,
    prioridad: "Media",
  },
  "Tarjeta entregada": {
    tipo: "Visitar empresa",
    objetivo: "Volver a visitar para obtener contacto",
    dias: 7,
    prioridad: "Media",
  },
  "Nombre de contacto obtenido": {
    tipo: "Llamar",
    objetivo: "Contactar responsable",
    dias: 2,
    prioridad: "Alta",
  },
  "Teléfono obtenido": {
    tipo: "Llamar",
    objetivo: "Contactar responsable",
    dias: 2,
    prioridad: "Alta",
  },
  "Correo obtenido": {
    tipo: "Enviar presentación",
    objetivo: "Enviar presentación",
    dias: 0,
    prioridad: "Alta",
  },
  "Solicitaron regresar": {
    tipo: "Visitar empresa",
    objetivo: "Visita de seguimiento",
    dias: 7,
    prioridad: "Alta",
  },
  "Solicitaron información": {
    tipo: "Correo",
    objetivo: "Enviar información solicitada",
    dias: 1,
    prioridad: "Alta",
  },
  "Solicitaron cotización": {
    tipo: "Preparar cotización",
    objetivo: "Preparar cotización solicitada",
    dias: 2,
    prioridad: "Alta",
  },
  "Solicitaron visita técnica": {
    tipo: "Visita técnica",
    objetivo: "Agendar visita técnica",
    dias: 3,
    prioridad: "Alta",
  },
  "Necesidad detectada": {
    tipo: "Seguimiento",
    objetivo: "Definir alcance de la necesidad",
    dias: 2,
    prioridad: "Alta",
  },
};

/** Estados que se consideran "activos" para la regla de próxima acción. */
export const ESTADOS_ACTIVOS: string[] = [
  "Pendiente de visitar",
  "Visitada sin contacto",
  "Contacto identificado",
  "Contactada",
  "Interesada",
  "Oportunidad activa",
  "Cotización activa",
  "Cliente",
];

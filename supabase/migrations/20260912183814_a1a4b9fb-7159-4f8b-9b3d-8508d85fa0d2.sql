ALTER TABLE public.oportunidades
  ADD COLUMN IF NOT EXISTS motivo_perdida text,
  ADD COLUMN IF NOT EXISTS nota_perdida text,
  ADD COLUMN IF NOT EXISTS competidor_ganador text,
  ADD COLUMN IF NOT EXISTS fecha_perdida date;
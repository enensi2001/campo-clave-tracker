-- =========================
-- CRM Industrial B2B — esquema
-- =========================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- EMPRESAS
CREATE TABLE public.empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid DEFAULT auth.uid(),
  nombre text NOT NULL,
  nombre_comercial text,
  industria text,
  direccion text,
  ciudad text,
  estado text,
  parque_industrial text,
  latitud double precision,
  longitud double precision,
  sitio_web text,
  telefono_general text,
  origen text NOT NULL DEFAULT 'Otro',
  estado_comercial text NOT NULL DEFAULT 'Pendiente de visitar',
  notas text,
  ultima_interaccion date,
  proxima_accion text,
  fecha_proxima_accion date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CONTACTOS
CREATE TABLE public.contactos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid DEFAULT auth.uid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  apellidos text,
  area text,
  puesto text,
  telefono text,
  whatsapp text,
  correo text,
  linkedin text,
  extension text,
  nivel_contacto text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- VISITAS
CREATE TABLE public.visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid DEFAULT auth.uid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  contacto_id uuid REFERENCES public.contactos(id) ON DELETE SET NULL,
  fecha date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Mexico_City')::date,
  hora time,
  latitud double precision,
  longitud double precision,
  tipo_visita text NOT NULL DEFAULT 'Primera visita',
  resultado text NOT NULL DEFAULT 'Otro',
  informacion_obtenida text,
  material_entregado text,
  notas text,
  proxima_accion text,
  fecha_proxima_accion date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- OPORTUNIDADES
CREATE TABLE public.oportunidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid DEFAULT auth.uid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  contacto_id uuid REFERENCES public.contactos(id) ON DELETE SET NULL,
  nombre_proyecto text NOT NULL,
  necesidad text,
  problema_detectado text,
  solucion_propuesta text,
  valor_estimado numeric(14,2) DEFAULT 0,
  moneda text NOT NULL DEFAULT 'MXN',
  probabilidad integer NOT NULL DEFAULT 20,
  fecha_estimada_cierre date,
  competencia text,
  etapa text NOT NULL DEFAULT 'Necesidad detectada',
  notas text,
  ultima_interaccion date,
  proxima_accion text,
  fecha_proxima_accion date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- COTIZACIONES
CREATE TABLE public.cotizaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid DEFAULT auth.uid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  contacto_id uuid REFERENCES public.contactos(id) ON DELETE SET NULL,
  oportunidad_id uuid REFERENCES public.oportunidades(id) ON DELETE SET NULL,
  folio text NOT NULL,
  fecha date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Mexico_City')::date,
  descripcion text,
  importe numeric(14,2) NOT NULL DEFAULT 0,
  moneda text NOT NULL DEFAULT 'MXN',
  archivo_pdf text,
  vigencia date,
  tiempo_entrega text,
  estado text NOT NULL DEFAULT 'Preparación',
  fecha_ultimo_seguimiento date,
  fecha_proximo_seguimiento date,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ACTIVIDADES
CREATE TABLE public.actividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid DEFAULT auth.uid(),
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  contacto_id uuid REFERENCES public.contactos(id) ON DELETE SET NULL,
  oportunidad_id uuid REFERENCES public.oportunidades(id) ON DELETE SET NULL,
  cotizacion_id uuid REFERENCES public.cotizaciones(id) ON DELETE SET NULL,
  tipo text NOT NULL DEFAULT 'Seguimiento',
  fecha date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Mexico_City')::date,
  hora time,
  prioridad text NOT NULL DEFAULT 'Media',
  objetivo text,
  estado text NOT NULL DEFAULT 'Pendiente',
  resultado text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_contactos_empresa ON public.contactos(empresa_id);
CREATE INDEX idx_visitas_empresa ON public.visitas(empresa_id);
CREATE INDEX idx_visitas_fecha ON public.visitas(fecha DESC);
CREATE INDEX idx_oportunidades_empresa ON public.oportunidades(empresa_id);
CREATE INDEX idx_cotizaciones_empresa ON public.cotizaciones(empresa_id);
CREATE INDEX idx_actividades_empresa ON public.actividades(empresa_id);
CREATE INDEX idx_actividades_fecha ON public.actividades(fecha);

-- Triggers updated_at
CREATE TRIGGER trg_empresas_upd BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_contactos_upd BEFORE UPDATE ON public.contactos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_visitas_upd BEFORE UPDATE ON public.visitas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_oportunidades_upd BEFORE UPDATE ON public.oportunidades FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_cotizaciones_upd BEFORE UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_actividades_upd BEFORE UPDATE ON public.actividades FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.empresas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contactos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oportunidades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cotizaciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.actividades TO authenticated;
GRANT ALL ON public.empresas TO service_role;
GRANT ALL ON public.contactos TO service_role;
GRANT ALL ON public.visitas TO service_role;
GRANT ALL ON public.oportunidades TO service_role;
GRANT ALL ON public.cotizaciones TO service_role;
GRANT ALL ON public.actividades TO service_role;

-- RLS
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresas_own_or_demo" ON public.empresas FOR ALL TO authenticated
  USING (owner_id IS NULL OR owner_id = auth.uid())
  WITH CHECK (owner_id IS NULL OR owner_id = auth.uid());
CREATE POLICY "contactos_own_or_demo" ON public.contactos FOR ALL TO authenticated
  USING (owner_id IS NULL OR owner_id = auth.uid())
  WITH CHECK (owner_id IS NULL OR owner_id = auth.uid());
CREATE POLICY "visitas_own_or_demo" ON public.visitas FOR ALL TO authenticated
  USING (owner_id IS NULL OR owner_id = auth.uid())
  WITH CHECK (owner_id IS NULL OR owner_id = auth.uid());
CREATE POLICY "oportunidades_own_or_demo" ON public.oportunidades FOR ALL TO authenticated
  USING (owner_id IS NULL OR owner_id = auth.uid())
  WITH CHECK (owner_id IS NULL OR owner_id = auth.uid());
CREATE POLICY "cotizaciones_own_or_demo" ON public.cotizaciones FOR ALL TO authenticated
  USING (owner_id IS NULL OR owner_id = auth.uid())
  WITH CHECK (owner_id IS NULL OR owner_id = auth.uid());
CREATE POLICY "actividades_own_or_demo" ON public.actividades FOR ALL TO authenticated
  USING (owner_id IS NULL OR owner_id = auth.uid())
  WITH CHECK (owner_id IS NULL OR owner_id = auth.uid());

-- Storage para PDFs de cotizaciones (bucket creado con la herramienta de storage)
CREATE POLICY "cotizaciones_pdf_read" ON storage.objects FOR SELECT USING (bucket_id = 'cotizaciones');
CREATE POLICY "cotizaciones_pdf_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cotizaciones');
CREATE POLICY "cotizaciones_pdf_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'cotizaciones');
CREATE POLICY "cotizaciones_pdf_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cotizaciones');

-- =========================
-- DATOS DE DEMOSTRACIÓN
-- =========================
INSERT INTO public.empresas (id, owner_id, nombre, nombre_comercial, industria, direccion, ciudad, estado, parque_industrial, latitud, longitud, sitio_web, telefono_general, origen, estado_comercial, notas, ultima_interaccion, proxima_accion, fecha_proxima_accion) VALUES
('11111111-1111-1111-1111-111111111101', NULL, 'Aceros del Bajío SA de CV', 'Aceros Bajío', 'Metalmecánica', 'Av. Industria 120', 'Querétaro', 'Querétaro', 'Parque Industrial Benito Juárez', 20.6100, -100.3800, 'https://acerosbajio.mx', '4421001010', 'Recorrido físico', 'Pendiente de visitar', 'Detectada en recorrido por el parque industrial.', NULL, 'Primera visita de prospección', (now() AT TIME ZONE 'America/Mexico_City')::date),
('11111111-1111-1111-1111-111111111102', NULL, 'Plásticos Industriales del Centro', 'Plasticentro', 'Plásticos', 'Calle 5 Norte 45', 'Celaya', 'Guanajuato', 'Parque Industrial Celaya', 20.5230, -100.8150, 'https://plasticentro.mx', '4611002020', 'Google Maps', 'Visitada sin contacto', 'Solo se pudo dejar carta en caseta de seguridad.', ((now() AT TIME ZONE 'America/Mexico_City')::date - 9), 'Regresar para obtener contacto', ((now() AT TIME ZONE 'America/Mexico_City')::date - 2)),
('11111111-1111-1111-1111-111111111103', NULL, 'Alimentos Procesados Norte', 'APN', 'Alimentos', 'Blvd. Las Torres 900', 'San Luis Potosí', 'San Luis Potosí', 'Zona Industrial SLP', 22.1300, -100.9700, 'https://apnorte.com', '4441003030', 'Directorio', 'Contacto identificado', 'Mantenimiento interesado en bombas.', ((now() AT TIME ZONE 'America/Mexico_City')::date - 4), 'Llamar a jefe de mantenimiento', ((now() AT TIME ZONE 'America/Mexico_City')::date + 1)),
('11111111-1111-1111-1111-111111111104', NULL, 'Automotriz Precisión SA', 'AutoPrecisión', 'Automotriz', 'Av. Tecnológico 500', 'Querétaro', 'Querétaro', 'Parque Industrial El Marqués', 20.6300, -100.2900, 'https://autoprecision.mx', '4421004040', 'Recomendación', 'Oportunidad activa', 'Proyecto de compresores para línea 3.', ((now() AT TIME ZONE 'America/Mexico_City')::date - 3), 'Enviar propuesta técnica', ((now() AT TIME ZONE 'America/Mexico_City')::date + 3)),
('11111111-1111-1111-1111-111111111105', NULL, 'Química Industrial del Golfo', 'QIG', 'Química', 'Carretera Federal 180 km 12', 'Veracruz', 'Veracruz', 'Corredor Industrial Bruno Pagliai', 19.1500, -96.1200, 'https://qig.mx', '2291005050', 'Internet', 'Cotización activa', 'Cotización de instrumentación enviada.', ((now() AT TIME ZONE 'America/Mexico_City')::date - 6), 'Dar seguimiento a cotización', ((now() AT TIME ZONE 'America/Mexico_City')::date - 1)),
('11111111-1111-1111-1111-111111111106', NULL, 'Empaques Flexibles del Pacífico', 'EFP', 'Empaques', 'Av. del Puerto 300', 'Guadalajara', 'Jalisco', 'Parque Industrial Guadalajara', 20.6600, -103.3500, 'https://efpacifico.mx', '3331006060', 'Parque industrial', 'Cliente', 'Cliente desde este año, compra recurrente.', ((now() AT TIME ZONE 'America/Mexico_City')::date - 12), 'Visita de postventa', ((now() AT TIME ZONE 'America/Mexico_City')::date + 7));

INSERT INTO public.contactos (id, owner_id, empresa_id, nombre, apellidos, area, puesto, telefono, whatsapp, correo, nivel_contacto, notas) VALUES
('22222222-2222-2222-2222-222222222201', NULL, '11111111-1111-1111-1111-111111111103', 'Jorge', 'Ramírez Luna', 'Mantenimiento', 'Jefe de Mantenimiento', '4441112233', '4441112233', 'jramirez@apnorte.com', 'B — Influenciador técnico', 'Muy técnico, pide fichas de producto.'),
('22222222-2222-2222-2222-222222222202', NULL, '11111111-1111-1111-1111-111111111104', 'Laura', 'Méndez Ortiz', 'Proyectos', 'Gerente de Proyectos', '4422223344', '4422223344', 'lmendez@autoprecision.mx', 'A — Tomador de decisión', 'Autoriza inversiones hasta 1 MDP.'),
('22222222-2222-2222-2222-222222222203', NULL, '11111111-1111-1111-1111-111111111104', 'Raúl', 'Sánchez', 'Compras', 'Comprador Técnico', '4422223355', NULL, 'rsanchez@autoprecision.mx', 'D — Compras', 'Solicita 3 cotizaciones siempre.'),
('22222222-2222-2222-2222-222222222204', NULL, '11111111-1111-1111-1111-111111111105', 'Miriam', 'Cortés', 'Ingeniería', 'Ingeniera de Procesos', '2293334455', '2293334455', 'mcortes@qig.mx', 'B — Influenciador técnico', 'Definió el alcance técnico.'),
('22222222-2222-2222-2222-222222222205', NULL, '11111111-1111-1111-1111-111111111106', 'Alberto', 'Nava', 'Producción', 'Superintendente', '3334445566', NULL, 'anava@efpacifico.mx', 'A — Tomador de decisión', 'Cliente satisfecho.'),
('22222222-2222-2222-2222-222222222206', NULL, '11111111-1111-1111-1111-111111111103', 'Sofía', 'Delgado', 'Compras', 'Analista de Compras', '4441114455', NULL, 'sdelgado@apnorte.com', 'D — Compras', 'Pide orden de compra formal.');

INSERT INTO public.visitas (owner_id, empresa_id, contacto_id, fecha, hora, latitud, longitud, tipo_visita, resultado, informacion_obtenida, material_entregado, notas, proxima_accion, fecha_proxima_accion) VALUES
(NULL, '11111111-1111-1111-1111-111111111102', NULL, ((now() AT TIME ZONE 'America/Mexico_City')::date - 16), '10:15', 20.5230, -100.8150, 'Primera visita', 'Carta de presentación entregada', NULL, 'Carta de presentación', 'No permitieron acceso, se dejó carta en caseta.', 'Volver a visitar para obtener contacto', ((now() AT TIME ZONE 'America/Mexico_City')::date - 9)),
(NULL, '11111111-1111-1111-1111-111111111102', NULL, ((now() AT TIME ZONE 'America/Mexico_City')::date - 9), '11:40', 20.5230, -100.8150, 'Obtener contacto', 'Solo seguridad', NULL, 'Tarjeta', 'Seguridad indicó regresar con cita.', 'Insistir con recepción', ((now() AT TIME ZONE 'America/Mexico_City')::date - 2)),
(NULL, '11111111-1111-1111-1111-111111111103', NULL, ((now() AT TIME ZONE 'America/Mexico_City')::date - 20), '09:30', 22.1300, -100.9700, 'Primera visita', 'Nombre de contacto obtenido', 'Jefe de mantenimiento: Jorge Ramírez', 'Carta de presentación', 'Recepción proporcionó nombre del responsable.', 'Contactar responsable', ((now() AT TIME ZONE 'America/Mexico_City')::date - 18)),
(NULL, '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222201', ((now() AT TIME ZONE 'America/Mexico_City')::date - 4), '12:00', 22.1300, -100.9700, 'Visita comercial', 'Necesidad detectada', 'Fallas recurrentes en bombas de proceso', 'Catálogo técnico', 'Interés en solución de bombeo.', 'Preparar propuesta', ((now() AT TIME ZONE 'America/Mexico_City')::date + 1)),
(NULL, '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222202', ((now() AT TIME ZONE 'America/Mexico_City')::date - 14), '10:00', 20.6300, -100.2900, 'Visita técnica', 'Solicitaron cotización', 'Levantamiento de línea 3 realizado', 'Propuesta preliminar', 'Se midieron consumos de aire.', 'Cotizar compresores', ((now() AT TIME ZONE 'America/Mexico_City')::date - 10)),
(NULL, '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222202', ((now() AT TIME ZONE 'America/Mexico_City')::date - 3), '16:20', 20.6300, -100.2900, 'Seguimiento presencial', 'Solicitaron información', 'Piden comparativo de eficiencia', NULL, 'Reunión breve en planta.', 'Enviar comparativo', ((now() AT TIME ZONE 'America/Mexico_City')::date + 3)),
(NULL, '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222204', ((now() AT TIME ZONE 'America/Mexico_City')::date - 18), '11:00', 19.1500, -96.1200, 'Visita técnica', 'Solicitaron cotización', 'Alcance de instrumentación definido', 'Ficha técnica', 'Revisión de lazos de control.', 'Enviar cotización', ((now() AT TIME ZONE 'America/Mexico_City')::date - 12)),
(NULL, '11111111-1111-1111-1111-111111111106', '22222222-2222-2222-2222-222222222205', ((now() AT TIME ZONE 'America/Mexico_City')::date - 12), '13:30', 20.6600, -103.3500, 'Postventa', 'Otro', 'Equipo operando correctamente', NULL, 'Revisión de arranque de equipo entregado.', 'Visita de postventa', ((now() AT TIME ZONE 'America/Mexico_City')::date + 7));

INSERT INTO public.oportunidades (id, owner_id, empresa_id, contacto_id, nombre_proyecto, necesidad, problema_detectado, solucion_propuesta, valor_estimado, moneda, probabilidad, fecha_estimada_cierre, competencia, etapa, notas, ultima_interaccion, proxima_accion, fecha_proxima_accion) VALUES
('33333333-3333-3333-3333-333333333301', NULL, '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222201', 'Renovación de bombas de proceso', 'Reemplazo de 3 bombas centrífugas', 'Paros no programados por cavitación', 'Bombas de proceso con sellos mecánicos', 480000.00, 'MXN', 40, ((now() AT TIME ZONE 'America/Mexico_City')::date + 30), 'Distribuidor local', 'Levantamiento pendiente', 'Requiere levantamiento en sitio.', ((now() AT TIME ZONE 'America/Mexico_City')::date - 4), 'Agendar levantamiento', ((now() AT TIME ZONE 'America/Mexico_City')::date + 1)),
('33333333-3333-3333-3333-333333333302', NULL, '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222202', 'Compresores línea 3', 'Ampliación de capacidad de aire comprimido', 'Caídas de presión en línea 3', 'Compresor de tornillo 75 HP con secador', 1250000.00, 'MXN', 60, ((now() AT TIME ZONE 'America/Mexico_City')::date + 20), 'Atlas / Kaeser', 'Cotización', 'Comparativo de eficiencia solicitado.', ((now() AT TIME ZONE 'America/Mexico_City')::date - 3), 'Enviar comparativo técnico', ((now() AT TIME ZONE 'America/Mexico_City')::date + 3)),
('33333333-3333-3333-3333-333333333303', NULL, '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222204', 'Instrumentación de lazos críticos', 'Transmisores y válvulas de control', 'Lecturas inestables en reactor', 'Instrumentación con protocolo HART', 38000.00, 'USD', 50, ((now() AT TIME ZONE 'America/Mexico_City')::date + 25), 'Integrador regional', 'En revisión', 'Cotización enviada, en evaluación técnica.', ((now() AT TIME ZONE 'America/Mexico_City')::date - 6), 'Seguimiento de cotización', ((now() AT TIME ZONE 'America/Mexico_City')::date - 1)),
('33333333-3333-3333-3333-333333333304', NULL, '11111111-1111-1111-1111-111111111106', '22222222-2222-2222-2222-222222222205', 'Mantenimiento preventivo anual', 'Contrato de servicio anual', 'Falta de programa preventivo', 'Contrato de 4 visitas anuales', 220000.00, 'MXN', 90, ((now() AT TIME ZONE 'America/Mexico_City')::date - 5), NULL, 'Ganada', 'Contrato firmado.', ((now() AT TIME ZONE 'America/Mexico_City')::date - 12), NULL, NULL);

INSERT INTO public.cotizaciones (id, owner_id, empresa_id, contacto_id, oportunidad_id, folio, fecha, descripcion, importe, moneda, vigencia, tiempo_entrega, estado, fecha_ultimo_seguimiento, fecha_proximo_seguimiento, notas) VALUES
('44444444-4444-4444-4444-444444444401', NULL, '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333303', 'COT-2026-001', ((now() AT TIME ZONE 'America/Mexico_City')::date - 12), 'Transmisores de presión y válvulas de control', 38000.00, 'USD', ((now() AT TIME ZONE 'America/Mexico_City')::date + 18), '6 semanas', 'Enviada', ((now() AT TIME ZONE 'America/Mexico_City')::date - 9), ((now() AT TIME ZONE 'America/Mexico_City')::date - 2), 'Pendiente respuesta de ingeniería.'),
('44444444-4444-4444-4444-444444444402', NULL, '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333302', 'COT-2026-002', ((now() AT TIME ZONE 'America/Mexico_City')::date - 5), 'Compresor de tornillo 75 HP + secador refrigerativo', 1250000.00, 'MXN', ((now() AT TIME ZONE 'America/Mexico_City')::date + 25), '8 semanas', 'En revisión', ((now() AT TIME ZONE 'America/Mexico_City')::date - 2), ((now() AT TIME ZONE 'America/Mexico_City')::date + 2), 'Compras solicita comparativo.'),
('44444444-4444-4444-4444-444444444403', NULL, '11111111-1111-1111-1111-111111111106', '22222222-2222-2222-2222-222222222205', '33333333-3333-3333-3333-333333333304', 'COT-2025-118', ((now() AT TIME ZONE 'America/Mexico_City')::date - 40), 'Contrato de mantenimiento preventivo anual', 220000.00, 'MXN', ((now() AT TIME ZONE 'America/Mexico_City')::date - 10), 'Inmediato', 'Ganada', ((now() AT TIME ZONE 'America/Mexico_City')::date - 12), NULL, 'Orden de compra recibida.'),
('44444444-4444-4444-4444-444444444404', NULL, '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222206', '33333333-3333-3333-3333-333333333301', 'COT-2026-003', ((now() AT TIME ZONE 'America/Mexico_City')::date - 1), 'Bombas centrífugas de proceso (preliminar)', 480000.00, 'MXN', ((now() AT TIME ZONE 'America/Mexico_City')::date + 29), '5 semanas', 'Preparación', NULL, ((now() AT TIME ZONE 'America/Mexico_City')::date + 4), 'Falta levantamiento para cerrar alcance.');

INSERT INTO public.actividades (owner_id, empresa_id, contacto_id, oportunidad_id, cotizacion_id, tipo, fecha, hora, prioridad, objetivo, estado, resultado, notas) VALUES
(NULL, '11111111-1111-1111-1111-111111111101', NULL, NULL, NULL, 'Prospectar', (now() AT TIME ZONE 'America/Mexico_City')::date, '09:00', 'Alta', 'Primera visita de prospección', 'Pendiente', NULL, 'Llevar cartas de presentación.'),
(NULL, '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', NULL, 'Llamar', (now() AT TIME ZONE 'America/Mexico_City')::date, '11:00', 'Alta', 'Agendar levantamiento en sitio', 'Pendiente', NULL, NULL),
(NULL, '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333302', '44444444-4444-4444-4444-444444444402', 'Enviar presentación', (now() AT TIME ZONE 'America/Mexico_City')::date, '15:00', 'Media', 'Enviar comparativo de eficiencia', 'Pendiente', NULL, NULL),
(NULL, '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333303', '44444444-4444-4444-4444-444444444401', 'Seguimiento de cotización', ((now() AT TIME ZONE 'America/Mexico_City')::date - 2), '10:00', 'Alta', 'Confirmar recepción y dudas técnicas', 'Pendiente', NULL, 'Vencida, reprogramar.'),
(NULL, '11111111-1111-1111-1111-111111111102', NULL, NULL, NULL, 'Visitar empresa', ((now() AT TIME ZONE 'America/Mexico_City')::date - 2), '10:30', 'Media', 'Obtener contacto de mantenimiento', 'Pendiente', NULL, 'Insistir en recepción.'),
(NULL, '11111111-1111-1111-1111-111111111106', '22222222-2222-2222-2222-222222222205', '33333333-3333-3333-3333-333333333304', NULL, 'Postventa', ((now() AT TIME ZONE 'America/Mexico_City')::date + 7), '12:00', 'Baja', 'Visita de postventa trimestral', 'Pendiente', NULL, NULL),
(NULL, '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222201', NULL, NULL, 'Visitar empresa', ((now() AT TIME ZONE 'America/Mexico_City')::date - 4), '12:00', 'Media', 'Visita comercial', 'Completada', 'Necesidad detectada', 'Se creó oportunidad.'),
(NULL, '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333302', NULL, 'Levantamiento', ((now() AT TIME ZONE 'America/Mexico_City')::date - 14), '10:00', 'Alta', 'Levantamiento técnico línea 3', 'Completada', 'Levantamiento completo', NULL),
(NULL, '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333303', '44444444-4444-4444-4444-444444444401', 'Enviar cotización', ((now() AT TIME ZONE 'America/Mexico_City')::date - 12), '17:00', 'Alta', 'Enviar cotización de instrumentación', 'Completada', 'Cotización enviada por correo', NULL),
(NULL, '11111111-1111-1111-1111-111111111102', NULL, NULL, NULL, 'Visitar empresa', ((now() AT TIME ZONE 'America/Mexico_City')::date - 9), '11:40', 'Media', 'Obtener contacto', 'Completada', 'Solo seguridad', NULL);
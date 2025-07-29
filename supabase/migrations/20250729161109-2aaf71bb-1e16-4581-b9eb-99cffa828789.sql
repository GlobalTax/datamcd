-- FASE 1: Infraestructura Base para Sistema de Incidencias 360°

-- Tabla de proveedores (referenciada por incidents)
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  tax_id TEXT,
  provider_type TEXT, -- 'maintenance', 'supplier', 'service', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Vista para mapear base_restaurants a restaurant (compatibilidad)
CREATE VIEW public.restaurant AS 
SELECT 
  id,
  restaurant_name as name,
  site_number,
  address,
  city,
  state,
  country,
  postal_code,
  franchisee_name,
  franchisee_email,
  company_tax_id,
  seating_capacity,
  square_meters,
  opening_date,
  created_at,
  updated_at
FROM public.base_restaurants;

-- Nueva tabla de incidentes (siguiendo el esquema propuesto)
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  restaurant_id UUID REFERENCES public.base_restaurants(id),
  provider_id UUID REFERENCES public.providers(id),
  -- Campos adicionales para compatibilidad con datos existentes
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  estimated_resolution TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  -- Campos del Excel (mantener compatibilidad)
  nombre TEXT,
  naves TEXT,
  ingeniero TEXT,
  clasificacion TEXT,
  participante TEXT,
  periodo TEXT,
  importe_carto NUMERIC,
  documento_url TEXT,
  fecha_cierre TIMESTAMP WITH TIME ZONE,
  comentarios_cierre TEXT
);

-- Tabla de definiciones de métricas
CREATE TABLE public.metric_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  calc_sql TEXT, -- SQL para calcular la métrica
  unit TEXT, -- 'hours', 'days', 'euros', 'count', etc.
  category TEXT, -- 'performance', 'cost', 'quality', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de snapshots de métricas (valores calculados)
CREATE TABLE public.metric_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id UUID REFERENCES public.metric_definitions(id),
  value NUMERIC NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  restaurant_id UUID REFERENCES public.base_restaurants(id),
  metadata JSONB, -- datos adicionales del cálculo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de definiciones de reportes
CREATE TABLE public.report_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL, -- 'incidents', 'metrics', 'combined'
  config JSONB NOT NULL, -- columnas, filtros, chart-type, etc.
  schedule_cron TEXT, -- "0 8 * * 1" (lunes 08:00)
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de historial de reportes generados
CREATE TABLE public.report_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.report_definitions(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  file_url TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'generated', -- 'generated', 'sent', 'error'
  recipients JSONB, -- array de emails
  error_message TEXT,
  metadata JSONB
);

-- Tabla de notas de voz
CREATE TABLE public.voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  duration_seconds NUMERIC,
  language TEXT DEFAULT 'es',
  quality TEXT DEFAULT 'standard', -- 'low', 'standard', 'high'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de transcripciones
CREATE TABLE public.voice_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_note_id UUID REFERENCES public.voice_notes(id) UNIQUE NOT NULL,
  transcript TEXT,
  ai_summary TEXT,
  confidence_score NUMERIC, -- 0-1
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de vínculos entre notas de voz y entidades
CREATE TABLE public.voice_entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_note_id UUID REFERENCES public.voice_notes(id) NOT NULL,
  entity_type TEXT NOT NULL, -- 'incident', 'restaurant', 'provider'
  entity_id UUID NOT NULL,
  relationship_type TEXT DEFAULT 'related', -- 'created', 'updated', 'related'
  confidence_score NUMERIC, -- 0-1 para links automáticos
  created_by_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para optimización
CREATE INDEX idx_incidents_restaurant_id ON public.incidents(restaurant_id);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_priority ON public.incidents(priority);
CREATE INDEX idx_incidents_created_at ON public.incidents(created_at);
CREATE INDEX idx_incidents_type ON public.incidents(type);

CREATE INDEX idx_metric_snapshots_metric_date ON public.metric_snapshots(metric_id, snapshot_date);
CREATE INDEX idx_metric_snapshots_restaurant ON public.metric_snapshots(restaurant_id);

CREATE INDEX idx_voice_notes_user_id ON public.voice_notes(user_id);
CREATE INDEX idx_voice_notes_created_at ON public.voice_notes(created_at);

CREATE INDEX idx_voice_entity_links_voice_note ON public.voice_entity_links(voice_note_id);
CREATE INDEX idx_voice_entity_links_entity ON public.voice_entity_links(entity_type, entity_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON public.metric_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_definitions_updated_at BEFORE UPDATE ON public.report_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_entity_links ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para proveedores
CREATE POLICY "Authenticated users can manage providers" ON public.providers
FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas de acceso para incidentes
CREATE POLICY "Users can manage incidents for accessible restaurants" ON public.incidents
FOR ALL USING (
  restaurant_id IN (
    SELECT fr.base_restaurant_id 
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Políticas para métricas
CREATE POLICY "Users can view metrics for accessible restaurants" ON public.metric_definitions
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage metric definitions" ON public.metric_definitions
FOR ALL USING (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

CREATE POLICY "Users can view metric snapshots for accessible restaurants" ON public.metric_snapshots
FOR SELECT USING (
  restaurant_id IN (
    SELECT fr.base_restaurant_id 
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Políticas para reportes
CREATE POLICY "Users can manage their own reports" ON public.report_definitions
FOR ALL USING (created_by = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

CREATE POLICY "Users can view report snapshots of accessible reports" ON public.report_snapshots
FOR SELECT USING (
  report_id IN (
    SELECT id FROM public.report_definitions 
    WHERE created_by = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
  )
);

-- Políticas para notas de voz
CREATE POLICY "Users can manage their own voice notes" ON public.voice_notes
FOR ALL USING (user_id = auth.uid() OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

CREATE POLICY "Users can manage transcripts of their voice notes" ON public.voice_transcripts
FOR ALL USING (
  voice_note_id IN (
    SELECT id FROM public.voice_notes 
    WHERE user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

CREATE POLICY "Users can manage voice entity links of their notes" ON public.voice_entity_links
FOR ALL USING (
  voice_note_id IN (
    SELECT id FROM public.voice_notes 
    WHERE user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Insertar métricas básicas predefinidas
INSERT INTO public.metric_definitions (code, label, description, calc_sql, unit, category) VALUES
('MTTR', 'Mean Time To Resolution', 'Tiempo promedio de resolución de incidencias', 
 'SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FROM incidents WHERE resolved_at IS NOT NULL', 
 'hours', 'performance'),
 
('MTTA', 'Mean Time To Acknowledge', 'Tiempo promedio hasta asignación de incidencias',
 'SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) FROM incidents WHERE assigned_to IS NOT NULL',
 'hours', 'performance'),
 
('INCIDENT_COUNT', 'Total de Incidencias', 'Número total de incidencias en el período',
 'SELECT COUNT(*) FROM incidents WHERE created_at >= $1 AND created_at <= $2',
 'count', 'volume'),
 
('CRITICAL_INCIDENTS', 'Incidencias Críticas', 'Número de incidencias críticas',
 'SELECT COUNT(*) FROM incidents WHERE priority = ''critical'' AND created_at >= $1 AND created_at <= $2',
 'count', 'quality'),
 
('CAPEX_TOTAL', 'CAPEX Total', 'Inversión total en incidencias (CAPEX)',
 'SELECT COALESCE(SUM(importe_carto), 0) FROM incidents WHERE created_at >= $1 AND created_at <= $2',
 'euros', 'cost');
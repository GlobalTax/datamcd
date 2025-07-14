-- Crear tabla orquest_measures para almacenar medidas obtenidas desde Orquest
CREATE TABLE public.orquest_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT REFERENCES public.servicios_orquest(id),
  measure_type TEXT NOT NULL, -- 'SALES', 'TICKETS', 'FOOTFALL'
  value NUMERIC NOT NULL,
  from_time TIMESTAMPTZ NOT NULL,
  to_time TIMESTAMPTZ NOT NULL,
  measure_category TEXT DEFAULT 'real', -- 'real', 'forecast', 'projection'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  franchisee_id UUID REFERENCES public.franchisees(id),
  raw_data JSONB -- para almacenar respuesta completa de Orquest
);

-- Habilitar RLS
ALTER TABLE public.orquest_measures ENABLE ROW LEVEL SECURITY;

-- Política para que franchisees vean sus propias medidas
CREATE POLICY "Franchisees can view their received measures"
ON public.orquest_measures
FOR SELECT
USING (
  franchisee_id IN (
    SELECT f.id FROM franchisees f WHERE f.user_id = auth.uid()
  ) OR 
  get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin'])
);

-- Política para insertar medidas (sistema)
CREATE POLICY "System can insert measures"
ON public.orquest_measures
FOR INSERT
WITH CHECK (true);

-- Política para actualizar medidas (sistema)
CREATE POLICY "System can update measures status"
ON public.orquest_measures
FOR UPDATE
USING (true);

-- Índices para mejorar rendimiento
CREATE INDEX idx_orquest_measures_service_id ON public.orquest_measures(service_id);
CREATE INDEX idx_orquest_measures_franchisee_id ON public.orquest_measures(franchisee_id);
CREATE INDEX idx_orquest_measures_type_time ON public.orquest_measures(measure_type, from_time, to_time);
CREATE INDEX idx_orquest_measures_category ON public.orquest_measures(measure_category);
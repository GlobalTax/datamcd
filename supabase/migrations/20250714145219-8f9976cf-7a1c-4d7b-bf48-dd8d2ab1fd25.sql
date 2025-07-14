-- Crear tabla para tracking de medidas enviadas a Orquest
CREATE TABLE IF NOT EXISTS public.orquest_measures_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchisee_id UUID NOT NULL,
  service_id TEXT NOT NULL,
  measure_type TEXT NOT NULL CHECK (measure_type IN ('SALES', 'LABOR_COST', 'FOOD_COST', 'OPERATING_EXPENSES', 'NET_PROFIT')),
  value NUMERIC NOT NULL,
  period_from TIMESTAMP WITH TIME ZONE NOT NULL,
  period_to TIMESTAMP WITH TIME ZONE NOT NULL,
  restaurant_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'confirmed')),
  error_message TEXT,
  orquest_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.orquest_measures_sent ENABLE ROW LEVEL SECURITY;

-- Política para que franquiciados vean solo sus datos
CREATE POLICY "Franchisees can view their sent measures" 
ON public.orquest_measures_sent 
FOR SELECT 
USING (
  franchisee_id IN (
    SELECT f.id FROM franchisees f WHERE f.user_id = auth.uid()
  )
  OR get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text])
);

-- Política para insertar medidas
CREATE POLICY "System can insert measures" 
ON public.orquest_measures_sent 
FOR INSERT 
WITH CHECK (true);

-- Política para actualizar estado
CREATE POLICY "System can update measures status" 
ON public.orquest_measures_sent 
FOR UPDATE 
USING (true);

-- Agregar índices para mejorar rendimiento
CREATE INDEX idx_orquest_measures_franchisee_id ON public.orquest_measures_sent(franchisee_id);
CREATE INDEX idx_orquest_measures_service_id ON public.orquest_measures_sent(service_id);
CREATE INDEX idx_orquest_measures_period ON public.orquest_measures_sent(period_from, period_to);
CREATE INDEX idx_orquest_measures_type ON public.orquest_measures_sent(measure_type);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_orquest_measures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_orquest_measures_updated_at
  BEFORE UPDATE ON public.orquest_measures_sent
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orquest_measures_updated_at();
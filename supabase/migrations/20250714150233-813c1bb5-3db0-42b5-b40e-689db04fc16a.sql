-- Crear tabla para auditoría de previsiones enviadas a Orquest
CREATE TABLE IF NOT EXISTS public.orquest_forecasts_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id TEXT NOT NULL,
  forecast_type TEXT NOT NULL, -- 'sales', 'labor', 'demand', etc.
  period_from TIMESTAMP WITH TIME ZONE NOT NULL,
  period_to TIMESTAMP WITH TIME ZONE NOT NULL,
  forecast_data JSONB NOT NULL,
  franchisee_id UUID NOT NULL,
  restaurant_id UUID NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  orquest_response JSONB NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.orquest_forecasts_sent ENABLE ROW LEVEL SECURITY;

-- Política para que los franquiciados puedan ver sus previsiones enviadas
CREATE POLICY "Franchisees can view their sent forecasts" 
ON public.orquest_forecasts_sent 
FOR SELECT 
USING (
  franchisee_id IN (
    SELECT f.id FROM franchisees f WHERE f.user_id = auth.uid()
  ) OR 
  get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin'])
);

-- Política para que el sistema pueda insertar previsiones
CREATE POLICY "System can insert forecasts" 
ON public.orquest_forecasts_sent 
FOR INSERT 
WITH CHECK (true);

-- Política para que el sistema pueda actualizar el estado de las previsiones
CREATE POLICY "System can update forecasts status" 
ON public.orquest_forecasts_sent 
FOR UPDATE 
USING (true);
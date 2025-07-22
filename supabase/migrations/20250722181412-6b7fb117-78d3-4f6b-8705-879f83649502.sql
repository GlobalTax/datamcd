-- Rate Limiting System - Tablas para control de velocidad y seguridad

-- Tabla para registrar intentos de rate limiting por IP y endpoint
CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  last_request_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para bloqueos temporales de IPs
CREATE TABLE IF NOT EXISTS public.rate_limit_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  blocked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Rate limit exceeded',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para registrar violaciones y patrones sospechosos
CREATE TABLE IF NOT EXISTS public.rate_limit_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  requests_count INTEGER NOT NULL,
  block_duration INTEGER NOT NULL, -- en milisegundos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas de rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limit_entries_ip_endpoint 
ON public.rate_limit_entries(ip, endpoint);

CREATE INDEX IF NOT EXISTS idx_rate_limit_entries_window_start 
ON public.rate_limit_entries(window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limit_blocks_ip 
ON public.rate_limit_blocks(ip);

CREATE INDEX IF NOT EXISTS idx_rate_limit_blocks_blocked_until 
ON public.rate_limit_blocks(blocked_until);

CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_ip 
ON public.rate_limit_violations(ip);

CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_created_at 
ON public.rate_limit_violations(created_at);

-- RLS policies para rate limiting (solo lectura por sistema)
ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_violations ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver datos de rate limiting
CREATE POLICY "Only admins can access rate limit entries" 
ON public.rate_limit_entries 
FOR ALL 
USING (
  EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Only admins can access rate limit blocks" 
ON public.rate_limit_blocks 
FOR ALL 
USING (
  EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Only admins can access rate limit violations" 
ON public.rate_limit_violations 
FOR ALL 
USING (
  EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);

-- Función para limpiar registros antiguos automáticamente
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpiar entradas de rate limit más antiguas de 24 horas
  DELETE FROM public.rate_limit_entries 
  WHERE window_start < now() - interval '24 hours';
  
  -- Limpiar bloques expirados
  DELETE FROM public.rate_limit_blocks 
  WHERE blocked_until < now();
  
  -- Limpiar violaciones más antiguas de 7 días (para análisis de seguridad)
  DELETE FROM public.rate_limit_violations 
  WHERE created_at < now() - interval '7 days';
  
  -- Log de la limpieza
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    table_name,
    record_id,
    new_values
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', -- System user
    'MAINTENANCE',
    'rate_limiting',
    'cleanup_old_records',
    jsonb_build_object(
      'action', 'rate_limit_cleanup',
      'timestamp', now(),
      'automated', true
    )
  );
END;
$$;

-- Trigger para limpiar automáticamente registros antiguos cada día
-- (se puede configurar con pg_cron en producción)

COMMENT ON TABLE public.rate_limit_entries IS 'Registros de intentos de acceso por IP y endpoint para rate limiting';
COMMENT ON TABLE public.rate_limit_blocks IS 'IPs bloqueadas temporalmente por exceder rate limits';
COMMENT ON TABLE public.rate_limit_violations IS 'Historial de violaciones de rate limiting para análisis de seguridad';
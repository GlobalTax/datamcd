-- Agregar campos faltantes a la tabla orquest_measures existente
ALTER TABLE public.orquest_measures 
ADD COLUMN IF NOT EXISTS business_id TEXT DEFAULT 'MCDONALDS_ES',
ADD COLUMN IF NOT EXISTS measure_category TEXT DEFAULT 'real';

-- Agregar constraint para measure_category si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orquest_measures_measure_category_check') THEN
        ALTER TABLE public.orquest_measures ADD CONSTRAINT orquest_measures_measure_category_check 
        CHECK (measure_category IN ('real', 'forecast', 'projection'));
    END IF;
END $$;

-- Crear tabla para configuración de tipos de medidas
CREATE TABLE public.orquest_measure_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  measure_type TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  unit TEXT, -- 'EUR', 'COUNT', 'PERCENTAGE', 'HOURS', 'SCORE'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar tipos de medidas comunes para McDonald's
INSERT INTO public.orquest_measure_types (measure_type, display_name, description, unit) VALUES
('SALES', 'Ventas', 'Ventas totales por período', 'EUR'),
('TICKETS', 'Tickets', 'Número de transacciones', 'COUNT'),
('FOOTFALL', 'Tráfico', 'Número de clientes', 'COUNT'),
('ORDERS', 'Pedidos', 'Número de pedidos', 'COUNT'),
('AVERAGE_TICKET', 'Ticket Medio', 'Valor medio por transacción', 'EUR'),
('LABOR_HOURS', 'Horas de Trabajo', 'Horas trabajadas por empleados', 'HOURS'),
('CUSTOMER_SATISFACTION', 'Satisfacción', 'Puntuación de satisfacción', 'SCORE');

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.orquest_measure_types ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para orquest_measure_types
CREATE POLICY "Admins and advisors can view measure types"
  ON public.orquest_measure_types
  FOR SELECT
  USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

CREATE POLICY "Admins and advisors can manage measure types"
  ON public.orquest_measure_types
  FOR ALL
  USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

-- Crear índices adicionales si no existen
CREATE INDEX IF NOT EXISTS idx_orquest_measures_business_id ON public.orquest_measures(business_id);
CREATE INDEX IF NOT EXISTS idx_orquest_measures_category ON public.orquest_measures(measure_category);
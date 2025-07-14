-- Crear tabla para almacenar medidas de Orquest
CREATE TABLE public.orquest_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT REFERENCES public.servicios_orquest(id) ON DELETE CASCADE,
  measure_type TEXT NOT NULL, -- 'SALES', 'TICKETS', 'FOOTFALL', 'ORDERS', 'AVERAGE_TICKET'
  value NUMERIC NOT NULL,
  from_time TIMESTAMPTZ NOT NULL,
  to_time TIMESTAMPTZ NOT NULL,
  measure_category TEXT DEFAULT 'real' CHECK (measure_category IN ('real', 'forecast', 'projection')),
  business_id TEXT DEFAULT 'MCDONALDS_ES',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla para configuración de tipos de medidas
CREATE TABLE public.orquest_measure_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  measure_type TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  unit TEXT, -- 'EUR', 'COUNT', 'PERCENTAGE'
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

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.orquest_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orquest_measure_types ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para orquest_measures
CREATE POLICY "Admins and advisors can view orquest measures"
  ON public.orquest_measures
  FOR SELECT
  USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

CREATE POLICY "Admins and advisors can manage orquest measures"
  ON public.orquest_measures
  FOR ALL
  USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

-- Políticas RLS para orquest_measure_types
CREATE POLICY "Admins and advisors can view measure types"
  ON public.orquest_measure_types
  FOR SELECT
  USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

CREATE POLICY "Admins and advisors can manage measure types"
  ON public.orquest_measure_types
  FOR ALL
  USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

-- Índices para mejorar rendimiento
CREATE INDEX idx_orquest_measures_service_id ON public.orquest_measures(service_id);
CREATE INDEX idx_orquest_measures_type ON public.orquest_measures(measure_type);
CREATE INDEX idx_orquest_measures_time_range ON public.orquest_measures(from_time, to_time);
CREATE INDEX idx_orquest_measures_category ON public.orquest_measures(measure_category);
CREATE INDEX idx_orquest_measures_business_id ON public.orquest_measures(business_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_orquest_measures_updated_at
  BEFORE UPDATE ON public.orquest_measures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
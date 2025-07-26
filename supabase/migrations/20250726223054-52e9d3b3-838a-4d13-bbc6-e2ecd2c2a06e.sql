-- Actualizar tabla orquest_employees para capturar datos ricos de Orquest
ALTER TABLE orquest_employees 
ADD COLUMN nif text,
ADD COLUMN dia_trabajado integer DEFAULT 0,
ADD COLUMN asistencia_trabajo integer DEFAULT 0,
ADD COLUMN horas_netas_mensuales numeric DEFAULT 0,
ADD COLUMN turnos_cierre integer DEFAULT 0,
ADD COLUMN horas_nocturnas_tipo2 numeric DEFAULT 0,
ADD COLUMN horas_nocturnas_tipo3 numeric DEFAULT 0,
ADD COLUMN horas_vacaciones numeric DEFAULT 0,
ADD COLUMN horas_formacion_externa numeric DEFAULT 0,
ADD COLUMN horas_ausencia_justificada numeric DEFAULT 0,
ADD COLUMN horas_sancion numeric DEFAULT 0,
ADD COLUMN horas_compensacion_festivos numeric DEFAULT 0,
ADD COLUMN horas_festivo_no_trabajado numeric DEFAULT 0,
ADD COLUMN horas_ausencia_injustificada numeric DEFAULT 0,
ADD COLUMN horas_ausencia_parcial numeric DEFAULT 0,
ADD COLUMN horas_baja_it numeric DEFAULT 0,
ADD COLUMN horas_baja_accidente numeric DEFAULT 0,
ADD COLUMN dias_vacaciones integer DEFAULT 0,
ADD COLUMN dias_formacion_externa integer DEFAULT 0,
ADD COLUMN dias_ausencia_justificada integer DEFAULT 0,
ADD COLUMN dias_sancion integer DEFAULT 0,
ADD COLUMN dias_compensacion_festivos integer DEFAULT 0,
ADD COLUMN dias_festivo_no_trabajado integer DEFAULT 0,
ADD COLUMN dias_ausencia_injustificada integer DEFAULT 0,
ADD COLUMN dias_ausencia_parcial integer DEFAULT 0,
ADD COLUMN dias_baja_it integer DEFAULT 0,
ADD COLUMN dias_baja_accidente integer DEFAULT 0,
ADD COLUMN dias_otra_incidencia integer DEFAULT 0,
ADD COLUMN fecha_inicio_contrato date,
ADD COLUMN dias_cedido integer DEFAULT 0,
ADD COLUMN mes_datos integer,
ADD COLUMN año_datos integer;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_orquest_employees_nif ON orquest_employees(nif);
CREATE INDEX IF NOT EXISTS idx_orquest_employees_fecha_datos ON orquest_employees(año_datos, mes_datos);
CREATE INDEX IF NOT EXISTS idx_orquest_employees_franchisee ON orquest_employees(franchisee_id);

-- Crear tabla para métricas agregadas de Orquest
CREATE TABLE IF NOT EXISTS orquest_employee_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisee_id uuid REFERENCES franchisees(id),
  service_id text,
  mes integer NOT NULL,
  año integer NOT NULL,
  total_empleados integer DEFAULT 0,
  total_horas_netas numeric DEFAULT 0,
  total_horas_nocturnas numeric DEFAULT 0,
  total_ausencias integer DEFAULT 0,
  total_turnos_cierre integer DEFAULT 0,
  promedio_asistencia numeric DEFAULT 0,
  tasa_ausentismo numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(franchisee_id, service_id, año, mes)
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE orquest_employee_metrics ENABLE ROW LEVEL SECURITY;

-- Política para métricas de empleados Orquest
CREATE POLICY "Franchisees can view their metrics"
ON orquest_employee_metrics
FOR ALL
USING (
  franchisee_id IN (
    SELECT f.id FROM franchisees f WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);
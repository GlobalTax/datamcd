-- Crear tabla para almacenar empleados de Orquest
CREATE TABLE public.orquest_employees (
  id TEXT PRIMARY KEY,
  service_id TEXT,
  nombre TEXT,
  apellidos TEXT,
  email TEXT,
  telefono TEXT,
  puesto TEXT,
  departamento TEXT,
  fecha_alta DATE,
  fecha_baja DATE,
  estado TEXT,
  datos_completos JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de mapeo entre empleados de Orquest y empleados locales
CREATE TABLE public.orquest_employee_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orquest_employee_id TEXT REFERENCES public.orquest_employees(id) ON DELETE CASCADE,
  local_employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  service_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(orquest_employee_id, local_employee_id)
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.orquest_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orquest_employee_mapping ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para orquest_employees
CREATE POLICY "Admins and advisors can view orquest employees"
  ON public.orquest_employees
  FOR SELECT
  USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

CREATE POLICY "Admins and advisors can manage orquest employees"
  ON public.orquest_employees
  FOR ALL
  USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

-- Políticas RLS para orquest_employee_mapping
CREATE POLICY "Admins and advisors can view employee mapping"
  ON public.orquest_employee_mapping
  FOR SELECT
  USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

CREATE POLICY "Admins and advisors can manage employee mapping"
  ON public.orquest_employee_mapping
  FOR ALL
  USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

-- Índices para mejorar rendimiento
CREATE INDEX idx_orquest_employees_service_id ON public.orquest_employees(service_id);
CREATE INDEX idx_orquest_employees_updated_at ON public.orquest_employees(updated_at);
CREATE INDEX idx_orquest_employee_mapping_service_id ON public.orquest_employee_mapping(service_id);
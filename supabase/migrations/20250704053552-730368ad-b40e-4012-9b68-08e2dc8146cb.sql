-- Crear tabla de empleados
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.franchisee_restaurants(id) ON DELETE CASCADE,
  employee_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT,
  hire_date DATE NOT NULL,
  termination_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated', 'suspended')),
  
  -- Información de contrato
  contract_type TEXT NOT NULL CHECK (contract_type IN ('indefinido', 'temporal', 'practicas', 'becario', 'freelance')),
  contract_start_date DATE NOT NULL,
  contract_end_date DATE,
  
  -- Información salarial
  base_salary NUMERIC(10,2),
  hourly_rate NUMERIC(8,2),
  salary_frequency TEXT CHECK (salary_frequency IN ('mensual', 'quincenal', 'semanal', 'por_horas')),
  
  -- Horarios y tiempo
  weekly_hours NUMERIC(4,1) DEFAULT 40,
  schedule_type TEXT CHECK (schedule_type IN ('fijo', 'variable', 'turnos')),
  
  -- Vacaciones y permisos
  vacation_days_per_year INTEGER DEFAULT 22,
  vacation_days_used NUMERIC(4,1) DEFAULT 0,
  vacation_days_pending NUMERIC(4,1) DEFAULT 0,
  sick_days_used NUMERIC(4,1) DEFAULT 0,
  
  -- Información adicional
  social_security_number TEXT,
  bank_account TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  
  UNIQUE(restaurant_id, employee_number)
);

-- Crear tabla de registro de horarios
CREATE TABLE public.employee_time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  break_start TIMESTAMP WITH TIME ZONE,
  break_end TIMESTAMP WITH TIME ZONE,
  total_hours NUMERIC(4,2),
  overtime_hours NUMERIC(4,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de vacaciones y permisos
CREATE TABLE public.employee_time_off (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vacaciones', 'enfermedad', 'personal', 'maternidad', 'paternidad', 'otro')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested NUMERIC(4,1) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de nóminas
CREATE TABLE public.employee_payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Horas trabajadas
  regular_hours NUMERIC(6,2) DEFAULT 0,
  overtime_hours NUMERIC(6,2) DEFAULT 0,
  
  -- Salarios
  base_pay NUMERIC(10,2) DEFAULT 0,
  overtime_pay NUMERIC(10,2) DEFAULT 0,
  bonuses NUMERIC(10,2) DEFAULT 0,
  commissions NUMERIC(10,2) DEFAULT 0,
  
  -- Deducciones
  social_security NUMERIC(10,2) DEFAULT 0,
  income_tax NUMERIC(10,2) DEFAULT 0,
  other_deductions NUMERIC(10,2) DEFAULT 0,
  
  -- Totales
  gross_pay NUMERIC(10,2) NOT NULL,
  net_pay NUMERIC(10,2) NOT NULL,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  payment_date DATE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Crear índices para performance
CREATE INDEX idx_employees_restaurant_id ON public.employees(restaurant_id);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_time_tracking_employee_date ON public.employee_time_tracking(employee_id, date);
CREATE INDEX idx_time_off_employee_dates ON public.employee_time_off(employee_id, start_date, end_date);
CREATE INDEX idx_payroll_employee_period ON public.employee_payroll(employee_id, period_start, period_end);

-- Habilitar RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_payroll ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Franchisees can manage their restaurant employees" ON public.employees
  FOR ALL USING (
    restaurant_id IN (
      SELECT fr.id FROM public.franchisee_restaurants fr
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid()
    )
  );

CREATE POLICY "Advisors can manage all employees" ON public.employees
  FOR ALL USING (
    get_current_user_role() IN ('admin', 'asesor', 'advisor', 'superadmin')
  );

CREATE POLICY "Employee time tracking access" ON public.employee_time_tracking
  FOR ALL USING (
    employee_id IN (
      SELECT e.id FROM public.employees e
      JOIN public.franchisee_restaurants fr ON fr.id = e.restaurant_id
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid() OR get_current_user_role() IN ('admin', 'asesor', 'advisor', 'superadmin')
    )
  );

CREATE POLICY "Employee time off access" ON public.employee_time_off
  FOR ALL USING (
    employee_id IN (
      SELECT e.id FROM public.employees e
      JOIN public.franchisee_restaurants fr ON fr.id = e.restaurant_id
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid() OR get_current_user_role() IN ('admin', 'asesor', 'advisor', 'superadmin')
    )
  );

CREATE POLICY "Employee payroll access" ON public.employee_payroll
  FOR ALL USING (
    employee_id IN (
      SELECT e.id FROM public.employees e
      JOIN public.franchisee_restaurants fr ON fr.id = e.restaurant_id
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid() OR get_current_user_role() IN ('admin', 'asesor', 'advisor', 'superadmin')
    )
  );

-- Crear función para calcular vacaciones automáticamente
CREATE OR REPLACE FUNCTION public.calculate_vacation_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular días de vacaciones pendientes basado en días del año y días usados
  NEW.vacation_days_pending = NEW.vacation_days_per_year - NEW.vacation_days_used;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar vacaciones
CREATE TRIGGER update_vacation_balance
  BEFORE INSERT OR UPDATE OF vacation_days_used, vacation_days_per_year
  ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_vacation_balance();

-- Crear trigger para updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_tracking_updated_at
  BEFORE UPDATE ON public.employee_time_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_updated_at
  BEFORE UPDATE ON public.employee_payroll
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
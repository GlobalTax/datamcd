-- Fase 1: Reestructuración de Base de Datos para Orquest
-- Agregar franchisee_id a las tablas que lo necesitan

-- 1. Agregar franchisee_id a servicios_orquest
ALTER TABLE public.servicios_orquest 
ADD COLUMN franchisee_id UUID REFERENCES public.franchisees(id);

-- 2. Agregar franchisee_id a orquest_employees
ALTER TABLE public.orquest_employees 
ADD COLUMN franchisee_id UUID REFERENCES public.franchisees(id);

-- 3. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_servicios_orquest_franchisee_id ON public.servicios_orquest(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_orquest_employees_franchisee_id ON public.orquest_employees(franchisee_id);

-- 4. Actualizar políticas RLS para servicios_orquest
DROP POLICY IF EXISTS "Admins and advisors can view orquest services" ON public.servicios_orquest;
DROP POLICY IF EXISTS "Admins and advisors can manage orquest services" ON public.servicios_orquest;

-- Política para que franquiciados solo vean sus servicios
CREATE POLICY "Franchisees can view their services" 
ON public.servicios_orquest 
FOR SELECT 
USING (
  franchisee_id IN (
    SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
  ) OR 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text])
);

-- Política para que franquiciados puedan gestionar sus servicios
CREATE POLICY "Franchisees can manage their services" 
ON public.servicios_orquest 
FOR ALL 
USING (
  franchisee_id IN (
    SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
  ) OR 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text])
)
WITH CHECK (
  franchisee_id IN (
    SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
  ) OR 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text])
);

-- 5. Actualizar políticas RLS para orquest_employees
DROP POLICY IF EXISTS "Admins and advisors can view orquest employees" ON public.orquest_employees;
DROP POLICY IF EXISTS "Admins and advisors can manage orquest employees" ON public.orquest_employees;

-- Política para que franquiciados solo vean sus empleados
CREATE POLICY "Franchisees can view their orquest employees" 
ON public.orquest_employees 
FOR SELECT 
USING (
  franchisee_id IN (
    SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
  ) OR 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text])
);

-- Política para que el sistema pueda insertar empleados
CREATE POLICY "System can insert orquest employees" 
ON public.orquest_employees 
FOR INSERT 
WITH CHECK (true);

-- Política para que el sistema pueda actualizar empleados
CREATE POLICY "System can update orquest employees" 
ON public.orquest_employees 
FOR UPDATE 
USING (true);

-- 6. Actualizar política de orquest_measures para incluir filtro por franchisee_id en servicios
DROP POLICY IF EXISTS "Franchisees can view their received measures" ON public.orquest_measures;

CREATE POLICY "Franchisees can view their received measures" 
ON public.orquest_measures 
FOR SELECT 
USING (
  franchisee_id IN (
    SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
  ) OR 
  service_id IN (
    SELECT s.id FROM public.servicios_orquest s 
    JOIN public.franchisees f ON s.franchisee_id = f.id 
    WHERE f.user_id = auth.uid()
  ) OR 
  get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text])
);

-- 7. Crear tabla para mapear servicios existentes (temporal para migración)
CREATE TABLE IF NOT EXISTS public.temp_orquest_service_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT NOT NULL,
  franchisee_id UUID REFERENCES public.franchisees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
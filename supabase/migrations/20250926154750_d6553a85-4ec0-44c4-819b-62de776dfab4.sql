-- OPCIÓN 1: DESHABILITAR RLS TEMPORALMENTE PARA TESTING
-- Descomenta estas líneas si quieres eliminar TODOS los permisos temporalmente

-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.franchisees DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.franchisee_restaurants DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.base_restaurants DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.incidents DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: POLÍTICAS ULTRA-SIMPLES (RECOMENDADO)
-- Eliminar todas las políticas complicadas y crear políticas básicas

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Franchisees restricted access" ON public.franchisees;
DROP POLICY IF EXISTS "Franchisee restaurants access policy" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Base restaurants access policy" ON public.base_restaurants;
DROP POLICY IF EXISTS "Employees restricted sensitive data access" ON public.employees;
DROP POLICY IF EXISTS "Restaurant based incident access" ON public.incidents;

-- POLÍTICAS ULTRA-SIMPLES: Asesores ven TODO, franquiciados ven lo suyo
CREATE POLICY "Simple access policy" ON public.franchisees
FOR ALL USING (
  get_current_user_role() IN ('admin', 'superadmin', 'asesor') OR 
  user_id = auth.uid()
);

CREATE POLICY "Simple restaurants policy" ON public.franchisee_restaurants  
FOR ALL USING (
  get_current_user_role() IN ('admin', 'superadmin', 'asesor') OR
  franchisee_id IN (SELECT id FROM franchisees WHERE user_id = auth.uid())
);

CREATE POLICY "Simple base restaurants policy" ON public.base_restaurants
FOR ALL USING (
  get_current_user_role() IN ('admin', 'superadmin', 'asesor') OR
  auth.uid() IS NOT NULL
);

CREATE POLICY "Simple employees policy" ON public.employees
FOR ALL USING (
  get_current_user_role() IN ('admin', 'superadmin', 'asesor') OR
  restaurant_id IN (
    SELECT fr.id FROM franchisee_restaurants fr 
    JOIN franchisees f ON f.id = fr.franchisee_id 
    WHERE f.user_id = auth.uid()
  )
);

CREATE POLICY "Simple incidents policy" ON public.incidents
FOR ALL USING (
  get_current_user_role() IN ('admin', 'superadmin', 'asesor') OR
  restaurant_id IN (
    SELECT fr.id FROM franchisee_restaurants fr 
    JOIN franchisees f ON f.id = fr.franchisee_id 
    WHERE f.user_id = auth.uid()
  )
);

-- OPCIÓN 3: CREAR TABLA DE ACCESOS MULTI-TENANT
CREATE TABLE IF NOT EXISTS public.advisor_access_all (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid REFERENCES public.profiles(id),
  can_access_all boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insertar acceso total para asesores existentes
INSERT INTO public.advisor_access_all (advisor_id, can_access_all)
SELECT id, true FROM public.profiles 
WHERE role = 'asesor'
ON CONFLICT DO NOTHING;

-- RLS para la tabla de accesos
ALTER TABLE public.advisor_access_all ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advisors can manage their access" ON public.advisor_access_all
FOR ALL USING (advisor_id = auth.uid() OR get_current_user_role() IN ('admin', 'superadmin'));
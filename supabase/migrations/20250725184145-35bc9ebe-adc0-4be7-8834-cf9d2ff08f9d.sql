-- Simplificar políticas RLS para eliminar verificaciones de permisos complejas
-- Permitir acceso completo para usuarios autenticados

-- 1. Actualizar política para base_restaurants
DROP POLICY IF EXISTS "Superadmin full access to base restaurants" ON public.base_restaurants;
CREATE POLICY "Authenticated users can access base restaurants" ON public.base_restaurants
FOR ALL USING (auth.uid() IS NOT NULL);

-- 2. Actualizar política para franchisee_restaurants  
DROP POLICY IF EXISTS "Superadmin full access to franchisee restaurants" ON public.franchisee_restaurants;
CREATE POLICY "Authenticated users can access franchisee restaurants" ON public.franchisee_restaurants
FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. Actualizar política para franchisees
DROP POLICY IF EXISTS "Superadmin full access to franchisees" ON public.franchisees;
CREATE POLICY "Authenticated users can access franchisees" ON public.franchisees
FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Actualizar políticas para employees
DROP POLICY IF EXISTS "Franchisees can manage their restaurant employees" ON public.employees;
DROP POLICY IF EXISTS "Advisors can manage all employees" ON public.employees;
CREATE POLICY "Authenticated users can manage employees" ON public.employees
FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Actualizar políticas para annual_budgets
DROP POLICY IF EXISTS "Users can view annual budgets" ON public.annual_budgets;
DROP POLICY IF EXISTS "Users can create annual budgets" ON public.annual_budgets;
DROP POLICY IF EXISTS "Users can update annual budgets" ON public.annual_budgets;
DROP POLICY IF EXISTS "Users can delete annual budgets" ON public.annual_budgets;
CREATE POLICY "Authenticated users can manage annual budgets" ON public.annual_budgets
FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Mantener función is_superadmin para futuras necesidades
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean AS $$
BEGIN
  RETURN true; -- Simplificado: todos los usuarios autenticados son tratados como superadmin
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
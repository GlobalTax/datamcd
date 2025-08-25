-- FASE 1: Corregir recursión infinita en políticas RLS

-- 1. Crear función helper para evitar recursión en franchisees
CREATE OR REPLACE FUNCTION public.is_franchisee_owner(franchisee_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.franchisees 
    WHERE id = franchisee_uuid AND user_id = auth.uid()
  );
$$;

-- 2. Crear función helper para verificar si es staff de franquiciado
CREATE OR REPLACE FUNCTION public.is_franchisee_staff_member(franchisee_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.franchisee_staff 
    WHERE franchisee_id = franchisee_uuid AND user_id = auth.uid()
  );
$$;

-- 3. Crear función helper para restaurant members
CREATE OR REPLACE FUNCTION public.has_restaurant_member_access(restaurant_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.restaurant_members 
    WHERE restaurant_id = restaurant_uuid 
      AND user_id = auth.uid() 
      AND is_active = true
  );
$$;

-- 4. Recrear política de franchisees sin recursión
DROP POLICY IF EXISTS "Franchisees restricted access" ON public.franchisees;
CREATE POLICY "Franchisees restricted access" 
ON public.franchisees 
FOR ALL 
USING (
  get_current_user_role() = ANY(ARRAY['admin', 'superadmin']) OR 
  user_id = auth.uid() OR
  auth.uid() IN (
    SELECT fs.user_id FROM public.franchisee_staff fs 
    WHERE fs.franchisee_id = franchisees.id
  )
)
WITH CHECK (
  get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- 5. Recrear política de franchisee_staff sin recursión
DROP POLICY IF EXISTS "Franchisees can manage their staff" ON public.franchisee_staff;
CREATE POLICY "Franchisees can manage their staff" 
ON public.franchisee_staff 
FOR ALL 
USING (
  get_current_user_role() = ANY(ARRAY['admin', 'superadmin']) OR
  franchisee_id IN (
    SELECT id FROM public.franchisees WHERE user_id = auth.uid()
  )
);

-- 6. Crear política mejorada para restaurant_members
DROP POLICY IF EXISTS "Restaurant owners can view advisor assignments" ON public.advisor_restaurant;
CREATE POLICY "Restaurant owners can view advisor assignments" 
ON public.advisor_restaurant 
FOR SELECT 
USING (
  restaurant_id IN (
    SELECT rm.restaurant_id FROM public.restaurant_members rm
    WHERE rm.user_id = auth.uid() 
      AND rm.role = 'owner' 
      AND rm.is_active = true
  )
);

-- 7. Corregir funciones inseguras añadiendo search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 8. Recrear función audit_sensitive_table_access con search_path
CREATE OR REPLACE FUNCTION public.audit_sensitive_table_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to sensitive tables
  IF TG_TABLE_NAME IN ('employee_payroll', 'employees', 'company_data', 'integration_configs') THEN
    PERFORM public.log_sensitive_data_access(
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      TG_OP
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;
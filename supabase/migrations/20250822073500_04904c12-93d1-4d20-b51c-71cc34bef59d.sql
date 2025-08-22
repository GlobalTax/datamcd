-- ===== CORE SECURITY FIXES =====

-- 1. RESTRICT EMPLOYEE PII ACCESS - Create advisor-safe function
CREATE OR REPLACE FUNCTION public.get_employee_summary_for_advisor(restaurant_uuid uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  employee_position text,
  status text,
  hire_date date
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT 
    e.id,
    e.first_name,
    e.last_name,
    e."position" as employee_position,
    e.status,
    e.hire_date
  FROM public.employees e
  WHERE e.restaurant_id = restaurant_uuid
    AND advisor_has_restaurant_access(auth.uid(), restaurant_uuid);
$$;

-- 2. FIX OVERLY PERMISSIVE TABLES
-- Restrict contacts table to admin/superadmin only
DROP POLICY IF EXISTS "Authenticated users can manage contacts" ON public.contacts;
CREATE POLICY "Contacts restricted to admins" ON public.contacts
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['admin', 'superadmin']))
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin', 'superadmin']));

-- Restrict franchisees table access more appropriately  
DROP POLICY IF EXISTS "Authenticated users can access franchisees" ON public.franchisees;
CREATE POLICY "Franchisees restricted access" ON public.franchisees
FOR ALL
USING (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  user_id = auth.uid() OR
  id IN (
    SELECT fs.franchisee_id FROM public.franchisee_staff fs
    WHERE fs.user_id = auth.uid()
  )
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin'])
);

-- 3. ENHANCED AUDIT LOGGING FOR SENSITIVE DATA
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

-- Apply audit triggers to sensitive tables (only for modifications)
DROP TRIGGER IF EXISTS audit_employee_payroll_access ON public.employee_payroll;
CREATE TRIGGER audit_employee_payroll_access
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_payroll
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_table_access();

DROP TRIGGER IF EXISTS audit_employees_access ON public.employees;
CREATE TRIGGER audit_employees_access
  AFTER INSERT OR UPDATE OR DELETE ON public.employees  
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_table_access();
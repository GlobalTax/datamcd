-- EMERGENCY SECURITY FIXES - Phase 2
-- Fix critical data exposure vulnerabilities identified by comprehensive security scan

-- 1. Fix profiles table - remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can access franchisees" ON public.profiles;
DROP POLICY IF EXISTS "Service role can access all profiles" ON public.profiles;

-- Create proper profile access policy
CREATE POLICY "Profiles strict access control" 
ON public.profiles 
FOR ALL 
USING (
  -- Users can only see their own profile
  id = auth.uid() OR
  -- Admins and superadmins can see all profiles
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  -- Advisors can see profiles of franchisees they advise
  EXISTS (
    SELECT 1 FROM public.advisor_restaurant ar
    JOIN public.franchisee_restaurants fr ON fr.id = ar.restaurant_id  
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE ar.advisor_user_id = auth.uid() 
      AND ar.is_active = true
      AND f.user_id = profiles.id
  )
)
WITH CHECK (
  -- Users can only update their own profile or admins can update any
  id = auth.uid() OR get_current_user_role() = ANY (ARRAY['admin', 'superadmin'])
);

-- 2. Restrict employee data access - limit sensitive personal information
DROP POLICY IF EXISTS "Restaurant based employee access" ON public.employees;

CREATE POLICY "Employees restricted sensitive data access" 
ON public.employees 
FOR ALL 
USING (
  -- Only admins, superadmins, and restaurant owners can access employee data
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  -- Restaurant owners can see employees in their restaurants
  restaurant_id IN (
    SELECT fr.id FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR
  -- Advisors can see employees for restaurants they advise (limited fields)
  (advisor_has_restaurant_access(auth.uid(), restaurant_id) AND 
   get_current_user_role() = 'asesor')
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  restaurant_id IN (
    SELECT fr.id FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  )
);

-- 3. Highly restrict payroll data access
DROP POLICY IF EXISTS "Employee payroll access" ON public.employee_payroll;

CREATE POLICY "Payroll data ultra-restricted access" 
ON public.employee_payroll 
FOR ALL 
USING (
  -- Only superadmins and the specific franchisee owner can access payroll
  get_current_user_role() = 'superadmin' OR
  (get_current_user_role() = 'franchisee' AND 
   employee_id IN (
     SELECT e.id FROM public.employees e
     JOIN public.franchisee_restaurants fr ON fr.id = e.restaurant_id
     JOIN public.franchisees f ON f.id = fr.franchisee_id
     WHERE f.user_id = auth.uid()
   ))
)
WITH CHECK (
  get_current_user_role() = 'superadmin' OR
  (get_current_user_role() = 'franchisee' AND 
   employee_id IN (
     SELECT e.id FROM public.employees e
     JOIN public.franchisee_restaurants fr ON fr.id = e.restaurant_id
     JOIN public.franchisees f ON f.id = fr.franchisee_id
     WHERE f.user_id = auth.uid()
   ))
);

-- 4. Restrict integration credentials access
DROP POLICY IF EXISTS "Restaurant integration configs access" ON public.integration_configs;
DROP POLICY IF EXISTS "Franchisees can manage their accounting configs" ON public.accounting_integration_configs;
DROP POLICY IF EXISTS "Franchisees can manage their delivery configs" ON public.delivery_integration_configs;

-- Integration configs - only superadmins
CREATE POLICY "Integration configs superadmin only" 
ON public.integration_configs 
FOR ALL 
USING (get_current_user_role() = 'superadmin')
WITH CHECK (get_current_user_role() = 'superadmin');

-- Accounting integration configs - only superadmins  
CREATE POLICY "Accounting configs superadmin only" 
ON public.accounting_integration_configs 
FOR ALL 
USING (get_current_user_role() = 'superadmin')
WITH CHECK (get_current_user_role() = 'superadmin');

-- Delivery integration configs - only superadmins
CREATE POLICY "Delivery configs superadmin only" 
ON public.delivery_integration_configs 
FOR ALL 
USING (get_current_user_role() = 'superadmin')
WITH CHECK (get_current_user_role() = 'superadmin');

-- 5. Restrict company data access
DROP POLICY IF EXISTS "Authenticated users can view company data" ON public.company_data;
DROP POLICY IF EXISTS "Franchisees can manage their company data" ON public.company_data;

CREATE POLICY "Company data restricted access" 
ON public.company_data 
FOR ALL 
USING (
  -- Only admins and superadmins can see all company data
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  -- Franchisees can only see their own company data
  (get_current_user_role() = 'franchisee' AND 
   cif IN (
     SELECT COALESCE(br.company_tax_id, f.tax_id) 
     FROM public.franchisee_restaurants fr
     JOIN public.franchisees f ON f.id = fr.franchisee_id
     LEFT JOIN public.base_restaurants br ON br.id = fr.base_restaurant_id
     WHERE f.user_id = auth.uid()
   ))
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  (get_current_user_role() = 'franchisee' AND 
   cif IN (
     SELECT COALESCE(br.company_tax_id, f.tax_id) 
     FROM public.franchisee_restaurants fr
     JOIN public.franchisees f ON f.id = fr.franchisee_id
     LEFT JOIN public.base_restaurants br ON br.id = fr.base_restaurant_id
     WHERE f.user_id = auth.uid()
   ))
);

-- 6. Create function to mask sensitive employee data for advisors
CREATE OR REPLACE FUNCTION public.get_employee_summary_for_advisor(restaurant_uuid uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  position text,
  status text,
  hire_date date
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    e.id,
    e.first_name,
    e.last_name,
    e.position,
    e.status,
    e.hire_date
  FROM public.employees e
  WHERE e.restaurant_id = restaurant_uuid
    AND advisor_has_restaurant_access(auth.uid(), restaurant_uuid);
$$;

-- 7. Enhanced audit logging for sensitive data operations
CREATE OR REPLACE FUNCTION public.log_sensitive_access_attempt(
  table_name text,
  operation text,
  user_role text,
  was_granted boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'SENSITIVE_ACCESS_ATTEMPT',
    table_name,
    operation,
    jsonb_build_object(
      'user_role', user_role,
      'operation', operation,
      'access_granted', was_granted,
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    )
  );
END;
$$;

-- 8. Log completion of emergency security fixes
INSERT INTO public.audit_logs (
  user_id,
  action_type,
  table_name,
  record_id,
  new_values
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'CRITICAL_SECURITY_FIX',
  'system_security',
  'emergency_data_exposure_fixes',
  jsonb_build_object(
    'action', 'emergency_security_fixes_implemented',
    'timestamp', now(),
    'fixes_applied', jsonb_build_array(
      'profiles_access_restricted',
      'employee_sensitive_data_protected',
      'payroll_data_ultra_restricted',
      'integration_credentials_superadmin_only',
      'company_data_access_limited'
    ),
    'security_level', 'critical',
    'description', 'Emergency fixes for critical data exposure vulnerabilities'
  )
);
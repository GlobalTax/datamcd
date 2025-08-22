-- ===== CRITICAL SECURITY FIXES (CORRECTED) =====

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

-- 2. SECURE PAYROLL DATA - Make it ultra-restrictive
DROP POLICY IF EXISTS "Payroll data ultra-restricted access" ON public.employee_payroll;
CREATE POLICY "Payroll data ultra-restricted access" ON public.employee_payroll
FOR ALL
USING (
  get_current_user_role() = 'superadmin' OR 
  (
    get_current_user_role() = 'franchisee' AND
    employee_id IN (
      SELECT e.id FROM public.employees e
      JOIN public.franchisee_restaurants fr ON fr.id = e.restaurant_id
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  get_current_user_role() = 'superadmin' OR 
  (
    get_current_user_role() = 'franchisee' AND
    employee_id IN (
      SELECT e.id FROM public.employees e
      JOIN public.franchisee_restaurants fr ON fr.id = e.restaurant_id
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid()
    )
  )
);

-- 3. FIX OVERLY PERMISSIVE TABLES
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

-- 4. RATE LIMITING IMPLEMENTATION
CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  window_start timestamp with time zone NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rate_limit_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  violation_type text NOT NULL,
  request_count integer NOT NULL,
  window_start timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rate_limit_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL UNIQUE,
  blocked_until timestamp with time zone NOT NULL,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS rate_limit_entries_identifier_window_key 
ON public.rate_limit_entries (identifier, window_start);

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _identifier text,
  _max_requests integer DEFAULT 10,
  _window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  current_window timestamp with time zone;
  current_count integer;
  is_blocked boolean;
BEGIN
  -- Check if identifier is currently blocked
  SELECT EXISTS(
    SELECT 1 FROM public.rate_limit_blocks 
    WHERE identifier = _identifier AND blocked_until > now()
  ) INTO is_blocked;
  
  IF is_blocked THEN
    RETURN false;
  END IF;
  
  -- Calculate current window
  current_window := date_trunc('minute', now()) - 
    (EXTRACT(minute FROM now())::integer % _window_minutes) * interval '1 minute';
  
  -- Get or create rate limit entry
  INSERT INTO public.rate_limit_entries (identifier, window_start, request_count)
  VALUES (_identifier, current_window, 1)
  ON CONFLICT (identifier, window_start) 
  DO UPDATE SET request_count = rate_limit_entries.request_count + 1;
  
  -- Get current count
  SELECT request_count INTO current_count
  FROM public.rate_limit_entries
  WHERE identifier = _identifier AND window_start = current_window;
  
  -- Check if limit exceeded
  IF current_count > _max_requests THEN
    -- Log violation
    INSERT INTO public.rate_limit_violations (
      identifier, violation_type, request_count, window_start
    ) VALUES (
      _identifier, 'rate_limit_exceeded', current_count, current_window
    );
    
    -- Block for 1 hour after 3 violations in 1 hour
    IF (
      SELECT COUNT(*) FROM public.rate_limit_violations
      WHERE identifier = _identifier 
        AND created_at > now() - interval '1 hour'
    ) >= 3 THEN
      INSERT INTO public.rate_limit_blocks (identifier, blocked_until, reason)
      VALUES (_identifier, now() + interval '1 hour', 'Multiple rate limit violations')
      ON CONFLICT (identifier) DO UPDATE SET
        blocked_until = now() + interval '1 hour',
        reason = 'Multiple rate limit violations';
    END IF;
    
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 5. ENHANCED AUDIT LOGGING
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

-- Apply audit triggers to sensitive tables (INSERT, UPDATE, DELETE only)
DROP TRIGGER IF EXISTS audit_employee_payroll_access ON public.employee_payroll;
CREATE TRIGGER audit_employee_payroll_access
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_payroll
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_table_access();

DROP TRIGGER IF EXISTS audit_employees_access ON public.employees;
CREATE TRIGGER audit_employees_access
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_table_access();

-- 6. CREATE CLEANUP FUNCTION FOR RATE LIMITING
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Clean old rate limit entries (older than 24 hours)
  DELETE FROM public.rate_limit_entries 
  WHERE window_start < now() - interval '24 hours';
  
  -- Clean expired blocks
  DELETE FROM public.rate_limit_blocks 
  WHERE blocked_until < now();
  
  -- Clean old violations (older than 7 days for security analysis)
  DELETE FROM public.rate_limit_violations 
  WHERE created_at < now() - interval '7 days';
  
  -- Log cleanup
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    table_name,
    record_id,
    new_values
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'MAINTENANCE',
    'rate_limiting',
    'cleanup_old_records',
    jsonb_build_object(
      'action', 'rate_limit_cleanup',
      'timestamp', now(),
      'automated', true
    )
  );
END;
$$;
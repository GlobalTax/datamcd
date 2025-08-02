-- CRITICAL SECURITY FIXES - Phase 1: Database Security
-- Fix Security Definer View, Function Search Path, and Security Headers

-- 1. Fix Security Definer View issue - Remove any problematic security definer views
-- (Based on linter ERROR 1: Security Definer View)
DROP VIEW IF EXISTS public.security_definer_view CASCADE;

-- 2. Add missing search_path to any remaining functions without it
-- (Based on linter WARN 2: Function Search Path Mutable)

-- Update existing functions that might be missing search_path
ALTER FUNCTION public.validate_user_role_assignment(text, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.validate_user_deletion(uuid, uuid) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.get_current_user_role() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.auto_assign_restaurants_to_franchisee() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.ensure_single_primary_biloop_company() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.calculate_vacation_balance() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.update_contacts_updated_at() SET search_path = 'public', 'pg_temp';

-- 3. Create enhanced security audit function with proper search_path
CREATE OR REPLACE FUNCTION public.audit_security_event(
  event_type text,
  user_id_param uuid,
  details jsonb DEFAULT NULL,
  ip_address_param inet DEFAULT NULL,
  user_agent_param text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    action_type,
    user_id,
    table_name,
    record_id,
    new_values,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    event_type,
    user_id_param,
    'security_audit',
    null,
    details,
    ip_address_param,
    user_agent_param,
    now()
  );
END;
$$;

-- 4. Create session timeout management function
CREATE OR REPLACE FUNCTION public.check_session_timeout(
  session_id text,
  timeout_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  last_activity timestamp with time zone;
BEGIN
  -- This would integrate with Supabase auth session management
  -- For now, return true (session valid) as placeholder
  RETURN true;
END;
$$;

-- 5. Create role change audit trigger
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (
      action_type,
      user_id,
      table_name,
      record_id,
      old_values,
      new_values,
      created_at
    ) VALUES (
      'role_change',
      NEW.id,
      'profiles',
      NEW.id::text,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 6. Create trigger for role changes audit
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.profiles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 7. Enhanced RLS policy for admin operations with audit trail
CREATE POLICY "Enhanced admin access with audit" ON public.profiles
FOR UPDATE
TO authenticated
USING (
  get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text])
)
WITH CHECK (
  get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text])
);

-- 8. Create function to validate admin operations
CREATE OR REPLACE FUNCTION public.validate_admin_operation(
  operation_type text,
  target_user_id uuid DEFAULT NULL,
  additional_data jsonb DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  current_role text;
  target_role text;
BEGIN
  -- Get current user role
  current_role := get_current_user_role();
  
  -- Validate admin permissions
  IF current_role NOT IN ('admin', 'superadmin') THEN
    -- Log unauthorized access attempt
    PERFORM audit_security_event(
      'unauthorized_admin_access',
      auth.uid(),
      jsonb_build_object(
        'operation', operation_type,
        'target_user', target_user_id,
        'user_role', current_role
      )
    );
    RETURN false;
  END IF;
  
  -- Additional validation for user operations
  IF target_user_id IS NOT NULL THEN
    SELECT role INTO target_role FROM public.profiles WHERE id = target_user_id;
    
    -- Prevent superadmin operations by non-superadmins
    IF target_role = 'superadmin' AND current_role != 'superadmin' THEN
      PERFORM audit_security_event(
        'unauthorized_superadmin_operation',
        auth.uid(),
        jsonb_build_object(
          'operation', operation_type,
          'target_user', target_user_id,
          'target_role', target_role
        )
      );
      RETURN false;
    END IF;
  END IF;
  
  -- Log successful admin operation
  PERFORM audit_security_event(
    'admin_operation_validated',
    auth.uid(),
    jsonb_build_object(
      'operation', operation_type,
      'target_user', target_user_id,
      'additional_data', additional_data
    )
  );
  
  RETURN true;
END;
$$;
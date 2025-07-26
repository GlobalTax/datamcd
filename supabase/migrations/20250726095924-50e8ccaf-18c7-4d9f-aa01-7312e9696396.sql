-- CRITICAL SECURITY FIXES - FOCUSED APPROACH
-- ==========================================

-- 1. Fix the get_current_user_role function to prevent recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Add secure role validation function
CREATE OR REPLACE FUNCTION public.validate_role_change(new_role text, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  current_user_role text;
  target_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Get target user's current role
  SELECT role INTO target_user_role 
  FROM public.profiles 
  WHERE id = user_id;
  
  -- Only superadmin can change roles
  IF current_user_role != 'superadmin' THEN
    RETURN false;
  END IF;
  
  -- Prevent self-demotion from superadmin
  IF auth.uid() = user_id AND target_user_role = 'superadmin' AND new_role != 'superadmin' THEN
    RETURN false;
  END IF;
  
  -- Valid role values
  IF new_role NOT IN ('franchisee', 'admin', 'superadmin', 'staff', 'asesor') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 3. Add audit logging for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Log role changes
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (
      user_id,
      action_type,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      'ROLE_CHANGE',
      'profiles',
      NEW.id::text,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role, 'changed_by', auth.uid())
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Create trigger for role change auditing
DROP TRIGGER IF EXISTS trigger_audit_role_changes ON public.profiles;
CREATE TRIGGER trigger_audit_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 5. Add session security function
CREATE OR REPLACE FUNCTION public.validate_session_security()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Basic session validation
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user profile exists
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 6. Add comprehensive audit logging function
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  entity_type text,
  entity_id text,
  details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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
    action_type,
    entity_type,
    entity_id,
    details || jsonb_build_object(
      'timestamp', now(),
      'user_role', get_current_user_role()
    )
  );
END;
$$;

-- 7. Secure the profiles table role column
UPDATE public.profiles SET role = 'superadmin' WHERE role IS NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

-- 8. Update all existing database functions to have secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'franchisee'
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    RETURN new;
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_franchisee_data(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.franchisees 
    WHERE user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_auth_status(user_uuid uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT json_build_object(
    'has_profile', EXISTS(SELECT 1 FROM public.profiles WHERE id = user_uuid),
    'has_franchisee', EXISTS(SELECT 1 FROM public.franchisees WHERE user_id = user_uuid),
    'role', COALESCE((SELECT role FROM public.profiles WHERE id = user_uuid), 'franchisee'),
    'email', (SELECT email FROM public.profiles WHERE id = user_uuid)
  );
$$;

CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(franchisee_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.franchisee_staff 
    WHERE user_id = auth.uid() AND franchisee_id = franchisee_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.cleanup_local_storage_data()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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
    'SECURITY_CLEANUP',
    'localStorage',
    'cleanup_sensitive_data',
    jsonb_build_object(
      'action', 'localStorage_cleanup_completed',
      'timestamp', now(),
      'user_agent', 'system'
    )
  );
  
  RETURN 'LocalStorage cleanup logged successfully';
END;
$$;
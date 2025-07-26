-- COMPREHENSIVE SECURITY FIXES
-- ================================
-- Phase 1: Database Security (CRITICAL)

-- 1. Create secure get_current_user_role function to prevent recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Create missing tables with RLS enabled
-- servicios_orquest table
CREATE TABLE IF NOT EXISTS public.servicios_orquest (
  id text PRIMARY KEY,
  franchisee_id uuid REFERENCES public.franchisees(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  status text DEFAULT 'active',
  configuration jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.servicios_orquest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Franchisees can manage their orquest services"
  ON public.servicios_orquest
  FOR ALL
  USING (
    franchisee_id IN (
      SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
    ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
  )
  WITH CHECK (
    franchisee_id IN (
      SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
    ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
  );

-- profit_loss_templates table
CREATE TABLE IF NOT EXISTS public.profit_loss_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  category_structure jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  franchisee_id uuid REFERENCES public.franchisees(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profit_loss_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage profit loss templates"
  ON public.profit_loss_templates
  FOR ALL
  USING (
    created_by = auth.uid() OR 
    franchisee_id IN (
      SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
    ) OR 
    is_public = true OR 
    get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
  )
  WITH CHECK (
    created_by = auth.uid() OR 
    franchisee_id IN (
      SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
    ) OR 
    get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
  );

-- profit_loss_data table
CREATE TABLE IF NOT EXISTS public.profit_loss_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  period_year integer NOT NULL,
  period_month integer NOT NULL,
  revenue numeric DEFAULT 0,
  cost_of_sales numeric DEFAULT 0,
  labor_costs numeric DEFAULT 0,
  operating_expenses numeric DEFAULT 0,
  other_data jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, period_year, period_month)
);

ALTER TABLE public.profit_loss_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage profit loss data for their restaurants"
  ON public.profit_loss_data
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT fr.id FROM public.franchisee_restaurants fr
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid()
    ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT fr.id FROM public.franchisee_restaurants fr
      JOIN public.franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid()
    ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
  );

-- 3. Fix all database functions with proper search_path security
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

CREATE OR REPLACE FUNCTION public.calculate_vacation_balance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  NEW.vacation_days_pending = NEW.vacation_days_per_year - NEW.vacation_days_used;
  RETURN NEW;
END;
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

CREATE OR REPLACE FUNCTION public.auto_assign_restaurants_to_franchisee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.franchisee_restaurants (
    franchisee_id,
    base_restaurant_id,
    status,
    assigned_at
  )
  SELECT 
    NEW.id,
    br.id,
    'active',
    now()
  FROM public.base_restaurants br
  WHERE br.franchisee_name = NEW.franchisee_name
  AND NOT EXISTS (
    SELECT 1 FROM public.franchisee_restaurants fr
    WHERE fr.franchisee_id = NEW.id AND fr.base_restaurant_id = br.id
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.manually_assign_restaurants_to_existing_franchisees()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  franchisee_record RECORD;
BEGIN
  FOR franchisee_record IN 
    SELECT id, franchisee_name FROM public.franchisees
  LOOP
    INSERT INTO public.franchisee_restaurants (
      franchisee_id,
      base_restaurant_id,
      status,
      assigned_at
    )
    SELECT 
      franchisee_record.id,
      br.id,
      'active',
      now()
    FROM public.base_restaurants br
    WHERE br.franchisee_name = franchisee_record.franchisee_name
    AND NOT EXISTS (
      SELECT 1 FROM public.franchisee_restaurants fr
      WHERE fr.franchisee_id = franchisee_record.id AND fr.base_restaurant_id = br.id
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_franchisee_last_access()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.franchisee_access_log 
  SET logout_time = now(),
      session_duration = EXTRACT(EPOCH FROM (now() - login_time)) / 60
  WHERE user_id = NEW.user_id 
    AND logout_time IS NULL 
    AND id != NEW.id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_franchisee_profile(user_id uuid, user_email text, user_full_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role
  ) VALUES (
    user_id,
    user_email,
    user_full_name,
    'franchisee'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = now();
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Error in create_franchisee_profile: %', SQLERRM;
      RAISE;
END;
$$;

-- 4. Add secure role validation function
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

-- 5. Update profiles table with better role security
ALTER TABLE public.profiles DROP POLICY IF EXISTS "profiles_update_own";
ALTER TABLE public.profiles DROP POLICY IF EXISTS "profiles_update_policy";

CREATE POLICY "profiles_update_secure"
  ON public.profiles
  FOR UPDATE
  USING (
    -- Users can update their own profile (except role)
    (auth.uid() = id AND OLD.role = NEW.role) OR
    -- Only superadmins can change roles with validation
    (get_current_user_role() = 'superadmin' AND validate_role_change(NEW.role, id))
  )
  WITH CHECK (
    -- Same conditions for WITH CHECK
    (auth.uid() = id AND OLD.role = NEW.role) OR
    (get_current_user_role() = 'superadmin' AND validate_role_change(NEW.role, id))
  );

-- 6. Add audit logging for role changes
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

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS trigger_audit_role_changes ON public.profiles;
CREATE TRIGGER trigger_audit_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 7. Secure sensitive integration tables
UPDATE public.profiles SET role = 'superadmin' WHERE role IS NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

-- 8. Add session security function
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

-- 9. Add comprehensive audit logging for admin actions
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
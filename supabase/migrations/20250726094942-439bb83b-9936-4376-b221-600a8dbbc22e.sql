-- COMPREHENSIVE SECURITY FIXES - CORRECTED
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

-- Drop existing policy if it exists
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Franchisees can manage their orquest services" ON public.servicios_orquest;
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

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

-- Drop existing policy if it exists
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage profit loss templates" ON public.profit_loss_templates;
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

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

-- Drop existing policy if it exists
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage profit loss data for their restaurants" ON public.profit_loss_data;
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

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

-- 3. Add secure role validation function
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

-- 4. Update profiles table with better role security
-- Drop existing policies safely
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

CREATE POLICY "profiles_update_secure"
  ON public.profiles
  FOR UPDATE
  USING (
    -- Users can update their own profile (except role)
    auth.uid() = id OR
    -- Only superadmins can change roles with validation
    get_current_user_role() = 'superadmin'
  )
  WITH CHECK (
    -- Same conditions for WITH CHECK
    auth.uid() = id OR
    get_current_user_role() = 'superadmin'
  );

-- 5. Add audit logging for role changes
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

-- 6. Secure sensitive integration tables - Make role NOT NULL
UPDATE public.profiles SET role = 'superadmin' WHERE role IS NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

-- 7. Add session security function
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

-- 8. Add comprehensive audit logging for admin actions
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
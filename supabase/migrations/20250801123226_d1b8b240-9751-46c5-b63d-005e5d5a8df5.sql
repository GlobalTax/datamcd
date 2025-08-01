-- PHASE 1: Critical Role Security Fixes (Fixed)
-- Fix role escalation vulnerability and add proper access controls

-- 1. Drop and recreate the user_is_staff_of_franchisee function with correct parameter name
DROP FUNCTION IF EXISTS public.user_is_staff_of_franchisee(uuid);

-- 2. Create security definer function to get current user role (prevent RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = 'public', 'pg_temp';

-- 3. Create function to validate role assignments
CREATE OR REPLACE FUNCTION public.validate_role_assignment(target_user_id uuid, new_role text, assigner_user_id uuid)
RETURNS boolean AS $$
DECLARE
  assigner_role text;
  target_current_role text;
BEGIN
  -- Get assigner's role
  SELECT role INTO assigner_role FROM public.profiles WHERE id = assigner_user_id;
  
  -- Get target user's current role
  SELECT role INTO target_current_role FROM public.profiles WHERE id = target_user_id;
  
  -- Self-assignment rules: users can never change their own role
  IF target_user_id = assigner_user_id THEN
    RETURN false;
  END IF;
  
  -- Role hierarchy validation
  CASE assigner_role
    WHEN 'superadmin' THEN
      -- Superadmin can assign any role except to other superadmins
      RETURN target_current_role != 'superadmin';
    WHEN 'admin' THEN
      -- Admin can only assign franchisee/staff roles, not admin/superadmin
      RETURN new_role IN ('franchisee', 'staff') AND target_current_role NOT IN ('admin', 'superadmin');
    ELSE
      -- Other roles cannot assign roles
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_temp';

-- 4. Create trigger function to audit role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger AS $$
BEGIN
  -- Only log if role actually changed
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
      'role_changed',
      'profiles',
      NEW.id::text,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_temp';

-- 5. Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_profile_role_changes ON public.profiles;
CREATE TRIGGER audit_profile_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 6. Update profiles RLS policies to prevent self-role escalation
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Read policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (get_current_user_role() IN ('admin', 'superadmin'));

-- Update policies with role protection
CREATE POLICY "Users can update own profile except role" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND (
      -- Allow update only if role hasn't changed
      role = (SELECT role FROM public.profiles WHERE id = auth.uid())
      OR role IS NULL
    )
  );

CREATE POLICY "Admins can update profiles with validation" ON public.profiles
  FOR UPDATE
  USING (get_current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (
    get_current_user_role() IN ('admin', 'superadmin')
    AND (
      -- If role is being changed, validate the assignment
      role = (SELECT p.role FROM public.profiles p WHERE p.id = profiles.id)
      OR validate_role_assignment(id, role, auth.uid())
    )
  );

-- Insert policies
CREATE POLICY "System can create profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (
    -- Only allow system or admins to create profiles
    get_current_user_role() IN ('admin', 'superadmin')
    OR id = auth.uid() -- Allow self-creation during signup
  );

-- Delete policies (only superadmins can delete)
CREATE POLICY "Only superadmins can delete profiles" ON public.profiles
  FOR DELETE
  USING (get_current_user_role() = 'superadmin');

-- 7. Create function to check if user is staff of franchisee
CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(franchisee_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.franchisee_staff 
    WHERE user_id = auth.uid() AND franchisee_staff.franchisee_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = 'public', 'pg_temp';
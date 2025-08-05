-- Create enhanced security functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Enhanced admin action validation function
CREATE OR REPLACE FUNCTION public.validate_admin_action_enhanced(
  action_type text,
  target_user_id uuid DEFAULT NULL,
  action_data jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_role text;
  target_role text;
  requested_role text;
BEGIN
  -- Get current user role
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  
  -- If user not found or no role, deny
  IF current_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Handle different action types
  CASE action_type
    WHEN 'user_creation' THEN
      requested_role := action_data->>'role';
      
      -- Only admins and superadmins can create users
      IF current_role NOT IN ('admin', 'superadmin') THEN
        RETURN false;
      END IF;
      
      -- Superadmin can create anyone except other superadmins
      IF current_role = 'superadmin' THEN
        RETURN requested_role != 'superadmin';
      END IF;
      
      -- Admin can only create franchisee and staff
      IF current_role = 'admin' THEN
        RETURN requested_role IN ('franchisee', 'staff');
      END IF;
      
    WHEN 'user_deletion' THEN
      -- Get target user role if provided
      IF target_user_id IS NOT NULL THEN
        SELECT role INTO target_role FROM public.profiles WHERE id = target_user_id LIMIT 1;
        
        -- Superadmin can delete anyone except other superadmins
        IF current_role = 'superadmin' THEN
          RETURN target_role != 'superadmin';
        END IF;
        
        -- Admin can delete franchisee and staff
        IF current_role = 'admin' THEN
          RETURN target_role IN ('franchisee', 'staff');
        END IF;
      END IF;
      
    WHEN 'role_assignment' THEN
      requested_role := action_data->>'role';
      
      -- Only admins and superadmins can assign roles
      IF current_role NOT IN ('admin', 'superadmin') THEN
        RETURN false;
      END IF;
      
      -- Same rules as user creation
      IF current_role = 'superadmin' THEN
        RETURN requested_role != 'superadmin';
      END IF;
      
      IF current_role = 'admin' THEN
        RETURN requested_role IN ('franchisee', 'staff');
      END IF;
      
    ELSE
      -- Unknown action type, deny by default
      RETURN false;
  END CASE;
  
  -- Default deny
  RETURN false;
END;
$$;
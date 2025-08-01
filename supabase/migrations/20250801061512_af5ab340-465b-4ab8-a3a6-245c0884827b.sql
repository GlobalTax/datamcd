-- Fix the function parameter conflict by dropping and recreating

-- First drop the existing function
DROP FUNCTION IF EXISTS public.user_is_staff_of_franchisee(uuid);

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(target_franchisee_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.franchisee_staff 
    WHERE franchisee_id = target_franchisee_id 
    AND user_id = auth.uid()
  );
END;
$$;

-- Fix get_current_user_role function to ensure it has proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;
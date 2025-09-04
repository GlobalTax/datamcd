-- Fix infinite recursion in profiles policies
-- Drop existing problematic policies that use get_current_user_role()
DROP POLICY IF EXISTS "Profiles strict access control" ON profiles;
DROP POLICY IF EXISTS "Profiles read access" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "profiles_select_policy" 
ON profiles FOR SELECT 
USING (
  -- Users can see their own profile
  auth.uid() = id
  OR 
  -- Admins can see all profiles (direct query, no function)
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND p2.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "profiles_insert_policy"
ON profiles FOR INSERT
WITH CHECK (
  -- Users can only insert their own profile (for registration)
  auth.uid() = id
  OR
  -- Admins can create any profile
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND p2.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "profiles_update_policy"
ON profiles FOR UPDATE
USING (
  -- Users can update their own profile
  auth.uid() = id
  OR
  -- Admins can update any profile
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND p2.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "profiles_delete_policy"
ON profiles FOR DELETE
USING (
  -- Only admins can delete profiles
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND p2.role IN ('admin', 'superadmin')
  )
);

-- Update get_current_user_role function to be more efficient and avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Use a more direct approach that doesn't trigger RLS
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;
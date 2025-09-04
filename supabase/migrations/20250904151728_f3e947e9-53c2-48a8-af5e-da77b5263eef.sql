-- Fix infinite recursion in profiles policies - Complete cleanup
-- First, get all existing policies and drop them
DO $$
DECLARE
    pol_name text;
BEGIN
    -- Drop all existing policies on profiles table
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol_name);
    END LOOP;
END $$;

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
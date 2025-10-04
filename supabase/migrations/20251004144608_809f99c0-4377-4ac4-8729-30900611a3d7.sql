-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create SECURITY DEFINER helpers to avoid recursion in RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin','superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'superadmin'
  );
$$;

-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and superadmins can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Simple access policy" ON public.profiles;

-- Recreate non-recursive policies
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins and superadmins can view profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Superadmins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (public.is_superadmin());

CREATE POLICY "Superadmins can update profiles"
ON public.profiles
FOR UPDATE
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

CREATE POLICY "Superadmins can delete profiles"
ON public.profiles
FOR DELETE
USING (public.is_superadmin());
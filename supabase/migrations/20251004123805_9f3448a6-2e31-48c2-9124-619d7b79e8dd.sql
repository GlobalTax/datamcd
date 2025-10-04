-- PASO 1: Eliminar políticas problemáticas que causan recursión
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- PASO 2: Crear función SECURITY DEFINER para obtener el rol sin recursión
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- PASO 3: Crear políticas simples y seguras usando la función
CREATE POLICY "Anyone can view their own profile" 
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Superadmins can view all profiles" 
ON public.profiles
FOR SELECT
USING (public.get_my_role() = 'superadmin');

CREATE POLICY "Users can update own profile" 
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Superadmins can update all profiles" 
ON public.profiles
FOR UPDATE
USING (public.get_my_role() = 'superadmin')
WITH CHECK (public.get_my_role() = 'superadmin');

CREATE POLICY "Superadmins can insert profiles" 
ON public.profiles
FOR INSERT
WITH CHECK (public.get_my_role() = 'superadmin');

CREATE POLICY "Superadmins can delete profiles" 
ON public.profiles
FOR DELETE
USING (public.get_my_role() = 'superadmin');

-- PASO 4: Actualizar la función get_current_user_role para usar get_my_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;
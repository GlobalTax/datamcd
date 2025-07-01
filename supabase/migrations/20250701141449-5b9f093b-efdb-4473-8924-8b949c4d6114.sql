
-- Migración para corregir problemas de autenticación y RLS
-- Fecha: 2025-01-07

-- 1. Corregir la función get_current_user_role para manejar casos donde el perfil no existe
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'franchisee' -- valor por defecto si no existe perfil
  );
$$;

-- 2. Simplificar y corregir políticas de profiles para evitar recursión
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;

-- Políticas simplificadas para profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para service role (necesaria para operaciones administrativas)
CREATE POLICY "profiles_service_role_policy" ON public.profiles
  FOR ALL TO service_role USING (true);

-- 3. Optimizar políticas de franchisees
DROP POLICY IF EXISTS "Users can view own franchisee data" ON public.franchisees;
DROP POLICY IF EXISTS "Users can update own franchisee data" ON public.franchisees;
DROP POLICY IF EXISTS "Users can insert own franchisee data" ON public.franchisees;

CREATE POLICY "franchisees_select_policy" ON public.franchisees
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "franchisees_update_policy" ON public.franchisees
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "franchisees_insert_policy" ON public.franchisees
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 4. Optimizar políticas de franchisee_restaurants
DROP POLICY IF EXISTS "Franquiciados pueden ver sus restaurantes asignados" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Franquiciados pueden actualizar sus restaurantes asignados" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "Asesores pueden gestionar asignaciones de restaurantes" ON public.franchisee_restaurants;

CREATE POLICY "franchisee_restaurants_select_policy" ON public.franchisee_restaurants
  FOR SELECT USING (
    franchisee_id IN (
      SELECT id FROM public.franchisees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "franchisee_restaurants_update_policy" ON public.franchisee_restaurants
  FOR UPDATE USING (
    franchisee_id IN (
      SELECT id FROM public.franchisees WHERE user_id = auth.uid()
    )
  );

-- Política para asesores
CREATE POLICY "franchisee_restaurants_advisor_policy" ON public.franchisee_restaurants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('asesor', 'admin', 'superadmin')
    )
  );

-- 5. Optimizar políticas de base_restaurants
DROP POLICY IF EXISTS "Asesores pueden gestionar restaurantes base" ON public.base_restaurants;
DROP POLICY IF EXISTS "Franquiciados pueden ver restaurantes base" ON public.base_restaurants;

CREATE POLICY "base_restaurants_select_policy" ON public.base_restaurants
  FOR SELECT USING (true); -- Todos los usuarios autenticados pueden ver

CREATE POLICY "base_restaurants_advisor_policy" ON public.base_restaurants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('asesor', 'admin', 'superadmin')
    )
  );

-- 6. Crear índices adicionales para optimizar consultas críticas
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_franchisees_user_id_status ON public.franchisees(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_franchisee_restaurants_franchisee_status ON public.franchisee_restaurants(franchisee_id, status);

-- 7. Función para crear perfil automáticamente (mejorada)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'franchisee' -- rol por defecto
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Si ya existe el perfil, no hacer nada
    RETURN new;
  WHEN OTHERS THEN
    -- Log del error pero no fallar
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- 8. Asegurar que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Función para verificar si un usuario tiene datos de franquiciado
CREATE OR REPLACE FUNCTION public.user_has_franchisee_data(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.franchisees 
    WHERE user_id = user_uuid
  );
$$;

-- 10. Función para obtener el estado de autenticación del usuario
CREATE OR REPLACE FUNCTION public.get_user_auth_status(user_uuid UUID)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT json_build_object(
    'has_profile', EXISTS(SELECT 1 FROM public.profiles WHERE id = user_uuid),
    'has_franchisee', EXISTS(SELECT 1 FROM public.franchisees WHERE user_id = user_uuid),
    'role', COALESCE((SELECT role FROM public.profiles WHERE id = user_uuid), 'franchisee'),
    'email', (SELECT email FROM public.profiles WHERE id = user_uuid)
  );
$$;

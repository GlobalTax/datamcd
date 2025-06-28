
-- Configurar Row Level Security para las tablas principales

-- 1. Limpiar políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;

-- 2. Crear políticas RLS simples y funcionales para profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Configurar políticas para franchisees
DROP POLICY IF EXISTS "Enable all access for advisors on franchisees" ON public.franchisees;
DROP POLICY IF EXISTS "Enable read access for franchisees to own data" ON public.franchisees;
DROP POLICY IF EXISTS "Advisors can manage franchisees" ON public.franchisees;
DROP POLICY IF EXISTS "Franchisees can view own data" ON public.franchisees;

CREATE POLICY "franchisees_select_own" ON public.franchisees
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'asesor', 'advisor', 'superadmin')
  ));

CREATE POLICY "franchisees_all_for_advisors" ON public.franchisees
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'asesor', 'advisor', 'superadmin')
  ));

-- 4. Configurar políticas para franchisee_restaurants
ALTER TABLE public.franchisee_restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "franchisee_restaurants_select" ON public.franchisee_restaurants
  FOR SELECT USING (
    franchisee_id IN (
      SELECT id FROM public.franchisees 
      WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'asesor', 'advisor', 'superadmin')
    )
  );

CREATE POLICY "franchisee_restaurants_all_for_advisors" ON public.franchisee_restaurants
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'asesor', 'advisor', 'superadmin')
  ));

-- 5. Configurar políticas para base_restaurants (acceso público para lectura)
ALTER TABLE public.base_restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "base_restaurants_select_all" ON public.base_restaurants
  FOR SELECT USING (true);

CREATE POLICY "base_restaurants_all_for_advisors" ON public.base_restaurants
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'asesor', 'advisor', 'superadmin')
  ));

-- 6. Verificar y crear datos faltantes para el usuario existente
DO $$
DECLARE
    user_profile RECORD;
    franchisee_record RECORD;
BEGIN
    -- Verificar si el usuario samuel.lorente@gmail.com tiene perfil
    SELECT * INTO user_profile FROM public.profiles WHERE email = 'samuel.lorente@gmail.com';
    
    IF user_profile.id IS NULL THEN
        RAISE NOTICE 'Usuario no encontrado en profiles';
    ELSE
        -- Verificar si tiene datos de franquiciado
        SELECT * INTO franchisee_record FROM public.franchisees WHERE user_id = user_profile.id;
        
        IF franchisee_record.id IS NULL THEN
            -- Crear datos de franquiciado si no existen
            INSERT INTO public.franchisees (
                user_id,
                franchisee_name,
                company_name,
                total_restaurants,
                created_at,
                updated_at
            ) VALUES (
                user_profile.id,
                COALESCE(user_profile.full_name, 'Samuel Lorente'),
                'Empresa de Samuel Lorente',
                0,
                now(),
                now()
            );
            
            RAISE NOTICE 'Creado registro de franquiciado para usuario %', user_profile.email;
        ELSE
            RAISE NOTICE 'Usuario % ya tiene datos de franquiciado', user_profile.email;
        END IF;
    END IF;
END $$;

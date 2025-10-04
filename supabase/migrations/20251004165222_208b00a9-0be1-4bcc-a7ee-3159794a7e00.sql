-- ========================================
-- MIGRACIÓN IDEMPOTENTE: Arreglo RLS recursivo en profiles
-- ========================================

-- PASO 1: Eliminar TODAS las políticas existentes en public.profiles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
END $$;

-- PASO 2: Crear políticas RLS NO recursivas usando has_role
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid() 
    OR has_role(auth.uid(), 'asesor'::app_role)
    OR has_role(auth.uid(), 'admin_organizacion'::app_role)
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  USING (
    id = auth.uid()
    OR has_role(auth.uid(), 'asesor'::app_role)
  )
  WITH CHECK (
    id = auth.uid()
    OR has_role(auth.uid(), 'asesor'::app_role)
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'asesor'::app_role)
    OR auth.uid() IS NOT NULL
  );

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE
  USING (has_role(auth.uid(), 'asesor'::app_role));

-- PASO 3: Asegurar trigger de auto-creación
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'franchisee'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASO 4: Corregir datos de s.navarro@obn.es
DO $$
DECLARE
  v_current_user_id uuid := '62bdec15-90ae-4339-8416-39c847aee996';
  v_email text := 's.navarro@obn.es';
  v_franchisee_id uuid;
  v_old_user_id uuid := '8cace681-f0a3-4dd3-9dc6-70a5b8feb4d5';
  v_restaurants_linked int;
BEGIN
  -- Asegurar profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (v_current_user_id, v_email, 'Fran bueno', 'franchisee')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();

  -- Mover franchisee
  UPDATE public.franchisees
  SET user_id = v_current_user_id, updated_at = now()
  WHERE user_id = v_old_user_id
  RETURNING id INTO v_franchisee_id;

  IF v_franchisee_id IS NULL THEN
    SELECT id INTO v_franchisee_id 
    FROM public.franchisees 
    WHERE user_id = v_current_user_id
    LIMIT 1;
    
    IF v_franchisee_id IS NULL THEN
      INSERT INTO public.franchisees (franchisee_name, user_id, country)
      VALUES ('Fran bueno Franquicias', v_current_user_id, 'España')
      RETURNING id INTO v_franchisee_id;
    END IF;
  END IF;

  -- Asegurar role
  INSERT INTO public.user_roles (user_id, role, franchisee_id, is_active)
  VALUES (v_current_user_id, 'franquiciado'::app_role, v_franchisee_id, true)
  ON CONFLICT (user_id, role) DO UPDATE SET
    franchisee_id = EXCLUDED.franchisee_id,
    is_active = true;

  -- Vincular restaurantes
  INSERT INTO public.franchisee_restaurants (franchisee_id, base_restaurant_id, status, assigned_at)
  SELECT v_franchisee_id, br.id, 'active', now()
  FROM public.base_restaurants br
  WHERE br.franchisee_email = v_email
    AND NOT EXISTS (
      SELECT 1 FROM public.franchisee_restaurants fr
      WHERE fr.base_restaurant_id = br.id AND fr.franchisee_id = v_franchisee_id
    );

  GET DIAGNOSTICS v_restaurants_linked = ROW_COUNT;

  -- Actualizar contador
  UPDATE public.franchisees
  SET total_restaurants = (
    SELECT COUNT(*) FROM public.franchisee_restaurants fr
    WHERE fr.franchisee_id = v_franchisee_id AND fr.status = 'active'
  ),
  updated_at = now()
  WHERE id = v_franchisee_id;

  -- Limpiar usuario antiguo
  DELETE FROM public.user_roles WHERE user_id = v_old_user_id;
  
  RAISE NOTICE '✅ Acceso configurado: % restaurantes', COALESCE(v_restaurants_linked, 0);
END $$;
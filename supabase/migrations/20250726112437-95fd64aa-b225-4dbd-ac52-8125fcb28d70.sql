-- Crear función de utilidad para verificar roles de usuario
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT p.role 
  FROM public.profiles p 
  WHERE p.id = auth.uid()
$$;

-- Crear función para verificar si un usuario es staff de un franquiciado
CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(franchisee_uuid uuid)
RETURNS BOOLEAN 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.franchisee_staff fs 
    WHERE fs.user_id = auth.uid() 
    AND fs.franchisee_id = franchisee_uuid
  )
$$;

-- Habilitar RLS en servicios_orquest si existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'servicios_orquest' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.servicios_orquest ENABLE ROW LEVEL SECURITY';
    
    -- Crear política para servicios_orquest
    EXECUTE 'CREATE POLICY "Franchisees can manage their orquest services" 
    ON public.servicios_orquest 
    FOR ALL 
    TO authenticated
    USING (
      franchisee_id IN (
        SELECT f.id 
        FROM public.franchisees f 
        WHERE f.user_id = auth.uid()
      ) OR 
      public.get_current_user_role() = ANY(ARRAY[''admin'', ''superadmin''])
    )
    WITH CHECK (
      franchisee_id IN (
        SELECT f.id 
        FROM public.franchisees f 
        WHERE f.user_id = auth.uid()
      ) OR 
      public.get_current_user_role() = ANY(ARRAY[''admin'', ''superadmin''])
    )';
  END IF;
END $$;

-- Políticas para restaurant_incidents si existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_incidents' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage incidents for their restaurants" ON public.restaurant_incidents';
    
    EXECUTE 'CREATE POLICY "Users can manage incidents for their restaurants" 
    ON public.restaurant_incidents 
    FOR ALL 
    TO authenticated
    USING (
      restaurant_id IN (
        SELECT fr.id 
        FROM public.franchisee_restaurants fr
        JOIN public.franchisees f ON f.id = fr.franchisee_id
        WHERE f.user_id = auth.uid() OR public.user_is_staff_of_franchisee(f.id)
      ) OR 
      public.get_current_user_role() = ANY(ARRAY[''admin'', ''superadmin''])
    )
    WITH CHECK (
      restaurant_id IN (
        SELECT fr.id 
        FROM public.franchisee_restaurants fr
        JOIN public.franchisees f ON f.id = fr.franchisee_id
        WHERE f.user_id = auth.uid() OR public.user_is_staff_of_franchisee(f.id)
      ) OR 
      public.get_current_user_role() = ANY(ARRAY[''admin'', ''superadmin''])
    )';
  END IF;
END $$;

-- Políticas para restaurant_valuations (restaurant_id es TEXT)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_valuations' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage valuations for their restaurants" ON public.restaurant_valuations';
    
    EXECUTE 'CREATE POLICY "Users can manage valuations for their restaurants" 
    ON public.restaurant_valuations 
    FOR ALL 
    TO authenticated
    USING (
      restaurant_id IN (
        SELECT br.site_number 
        FROM public.base_restaurants br
        JOIN public.franchisee_restaurants fr ON fr.base_restaurant_id = br.id
        JOIN public.franchisees f ON f.id = fr.franchisee_id
        WHERE f.user_id = auth.uid() OR public.user_is_staff_of_franchisee(f.id)
      ) OR 
      public.get_current_user_role() = ANY(ARRAY[''admin'', ''superadmin''])
    )
    WITH CHECK (
      restaurant_id IN (
        SELECT br.site_number 
        FROM public.base_restaurants br
        JOIN public.franchisee_restaurants fr ON fr.base_restaurant_id = br.id
        JOIN public.franchisees f ON f.id = fr.franchisee_id
        WHERE f.user_id = auth.uid() OR public.user_is_staff_of_franchisee(f.id)
      ) OR 
      public.get_current_user_role() = ANY(ARRAY[''admin'', ''superadmin''])
    )';
  END IF;
END $$;

-- Políticas para stored_calculations si existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stored_calculations' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can access stored calculations for their restaurants" ON public.stored_calculations';
    
    EXECUTE 'CREATE POLICY "Users can access stored calculations for their restaurants" 
    ON public.stored_calculations 
    FOR ALL 
    TO authenticated
    USING (
      public.get_current_user_role() = ANY(ARRAY[''admin'', ''superadmin''])
    )
    WITH CHECK (
      public.get_current_user_role() = ANY(ARRAY[''admin'', ''superadmin''])
    )';
  END IF;
END $$;
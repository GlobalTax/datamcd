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

-- Habilitar RLS en servicios_orquest (tabla crítica sin RLS)
ALTER TABLE public.servicios_orquest ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para servicios_orquest
CREATE POLICY "Franchisees can manage their orquest services" 
ON public.servicios_orquest 
FOR ALL 
TO authenticated
USING (
  franchisee_id IN (
    SELECT f.id 
    FROM public.franchisees f 
    WHERE f.user_id = auth.uid()
  ) OR 
  public.get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  franchisee_id IN (
    SELECT f.id 
    FROM public.franchisees f 
    WHERE f.user_id = auth.uid()
  ) OR 
  public.get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Políticas para restaurant_incidents (tabla con RLS pero sin políticas)
CREATE POLICY "Users can manage incidents for their restaurants" 
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
  public.get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  restaurant_id IN (
    SELECT fr.id 
    FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR public.user_is_staff_of_franchisee(f.id)
  ) OR 
  public.get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Políticas para restaurant_valuations (tabla con RLS pero sin políticas)
CREATE POLICY "Users can manage valuations for their restaurants" 
ON public.restaurant_valuations 
FOR ALL 
TO authenticated
USING (
  restaurant_id IN (
    SELECT fr.id 
    FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR public.user_is_staff_of_franchisee(f.id)
  ) OR 
  public.get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  restaurant_id IN (
    SELECT fr.id 
    FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR public.user_is_staff_of_franchisee(f.id)
  ) OR 
  public.get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Políticas para stored_calculations (tabla con RLS pero sin políticas)
CREATE POLICY "Users can access stored calculations for their restaurants" 
ON public.stored_calculations 
FOR ALL 
TO authenticated
USING (
  restaurant_id IN (
    SELECT fr.id 
    FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR public.user_is_staff_of_franchisee(f.id)
  ) OR 
  public.get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  restaurant_id IN (
    SELECT fr.id 
    FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR public.user_is_staff_of_franchisee(f.id)
  ) OR 
  public.get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Configurar search_path para funciones restantes (solo las que podemos modificar)
ALTER FUNCTION public.hasnt_sequence(name, name) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.has_composite(name, name, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.has_composite(name, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.has_composite(name) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.hasnt_composite(name, name, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.hasnt_composite(name, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.hasnt_composite(name) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.has_foreign_table(name, name, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.has_foreign_table(name, name) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.has_foreign_table(name, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.has_foreign_table(name) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.hasnt_foreign_table(name, name, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.hasnt_foreign_table(name, name) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.hasnt_foreign_table(name, text) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.hasnt_foreign_table(name) SET search_path = 'public', 'pg_temp';

-- Optimizar configuración de seguridad de autenticación
UPDATE auth.config SET 
  password_min_length = 12,
  security_update_password_require_reauthentication = true,
  security_captcha_enabled = true
WHERE id = 'auth';
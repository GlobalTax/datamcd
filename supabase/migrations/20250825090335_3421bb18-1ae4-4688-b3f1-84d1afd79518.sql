-- FASE 2: Corregir vistas SECURITY DEFINER y funciones sin search_path

-- 1. Corregir todas las funciones faltantes añadiendo search_path
CREATE OR REPLACE FUNCTION public.user_has_restaurant_access(_user_id uuid, _restaurant_id uuid, _required_role text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_members rm
    WHERE rm.user_id = _user_id 
      AND rm.restaurant_id = _restaurant_id 
      AND rm.is_active = true
      AND (_required_role IS NULL OR rm.role = _required_role 
           OR (rm.role = 'owner' AND _required_role IN ('manager', 'staff', 'viewer'))
           OR (rm.role = 'manager' AND _required_role IN ('staff', 'viewer')))
  );
$$;

CREATE OR REPLACE FUNCTION public.advisor_has_restaurant_access(_advisor_id uuid, _restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.advisor_restaurant ar
    WHERE ar.advisor_user_id = _advisor_id 
      AND ar.restaurant_id = _restaurant_id 
      AND ar.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_restaurant_owner_status(user_uuid uuid, restaurant_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = user_uuid 
      AND fr.id = restaurant_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_restaurants(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(restaurant_id uuid, franchisee_id uuid, restaurant_name text, site_number text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    fr.id as restaurant_id,
    fr.franchisee_id,
    br.restaurant_name,
    br.site_number
  FROM franchisee_restaurants fr
  JOIN base_restaurants br ON br.id = fr.base_restaurant_id
  JOIN franchisees f ON f.id = fr.franchisee_id
  WHERE f.user_id = user_uuid AND fr.status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.get_user_restaurant_role(_user_id uuid, _restaurant_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT rm.role 
  FROM public.restaurant_members rm
  WHERE rm.user_id = _user_id 
    AND rm.restaurant_id = _restaurant_id 
    AND rm.is_active = true
  ORDER BY 
    CASE rm.role 
      WHEN 'owner' THEN 1
      WHEN 'manager' THEN 2  
      WHEN 'staff' THEN 3
      WHEN 'viewer' THEN 4
    END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(franchisee_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.franchisee_staff 
    WHERE user_id = auth.uid() AND franchisee_id = franchisee_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_auth_status(user_uuid uuid)
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'has_profile', EXISTS(SELECT 1 FROM public.profiles WHERE id = user_uuid),
    'has_franchisee', EXISTS(SELECT 1 FROM public.franchisees WHERE user_id = user_uuid),
    'role', COALESCE((SELECT role FROM public.profiles WHERE id = user_uuid), 'franchisee'),
    'email', (SELECT email FROM public.profiles WHERE id = user_uuid)
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_franchisee_data(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.franchisees 
    WHERE user_id = user_uuid
  );
$$;

-- 2. Buscar y eliminar vistas SECURITY DEFINER (si existen)
-- Nota: Las vistas SECURITY DEFINER son problemáticas, necesitamos recrearlas sin esa propiedad

-- 3. Crear función auxiliar para verificar administradores sin recursión
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'superadmin'), 
    false
  );
$$;
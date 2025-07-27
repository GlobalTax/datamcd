-- Crear función de seguridad para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Crear función para verificar si un usuario es staff de un franquiciado
CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(franchisee_id_param uuid)
RETURNS BOOLEAN 
LANGUAGE SQL 
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.franchisee_staff 
    WHERE user_id = auth.uid() AND franchisee_id = franchisee_id_param
  );
$$;
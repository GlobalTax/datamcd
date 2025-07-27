-- Eliminar la función existente y recrearla con el parámetro correcto
DROP FUNCTION IF EXISTS public.user_is_staff_of_franchisee(uuid);

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
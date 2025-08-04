-- Drop y recrear la función con el nombre correcto del parámetro
DROP FUNCTION IF EXISTS user_is_staff_of_franchisee(uuid);

CREATE OR REPLACE FUNCTION user_is_staff_of_franchisee(franchisee_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM franchisee_staff 
    WHERE franchisee_staff.franchisee_id = franchisee_uuid 
    AND franchisee_staff.user_id = auth.uid()
  );
$$;

-- Ajustar política RLS para incidents
DROP POLICY IF EXISTS "Users can manage incidents for accessible restaurants" ON incidents;

CREATE POLICY "Users can manage incidents for accessible restaurants"
ON incidents
FOR ALL
USING (
  -- Admins pueden ver todo
  get_current_user_role() = ANY(ARRAY['admin', 'superadmin']) OR
  -- Franquiciados pueden ver sus restaurantes
  restaurant_id IN (
    SELECT fr.base_restaurant_id
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR
  -- Usuario autenticado puede ver incidencias (temporal para testing)
  auth.uid() IS NOT NULL
);
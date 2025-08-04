-- Corregir políticas RLS para asegurar acceso completo de superadmins
-- y mejorar el acceso a datos de restaurantes

-- 1. Actualizar política de franchisee_restaurants para superadmins
DROP POLICY IF EXISTS "Authenticated users can access franchisee restaurants" ON franchisee_restaurants;
CREATE POLICY "Franchisee restaurants access policy" 
ON franchisee_restaurants 
FOR ALL 
USING (
  get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])
  OR 
  franchisee_id IN (
    SELECT f.id 
    FROM franchisees f 
    WHERE f.user_id = auth.uid()
  )
);

-- 2. Actualizar política de base_restaurants para superadmins
DROP POLICY IF EXISTS "Authenticated users can access base restaurants" ON base_restaurants;
CREATE POLICY "Base restaurants access policy" 
ON base_restaurants 
FOR ALL 
USING (
  get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])
  OR 
  auth.uid() IS NOT NULL
);

-- 3. Actualizar política de employees para superadmins
DROP POLICY IF EXISTS "Authenticated users can manage employees" ON employees;
CREATE POLICY "Employees access policy" 
ON employees 
FOR ALL 
USING (
  get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])
  OR 
  restaurant_id IN (
    SELECT fr.id 
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  )
);

-- 4. Actualizar política de incidents para superadmins
DROP POLICY IF EXISTS "Users can manage incidents for accessible restaurants" ON incidents;
CREATE POLICY "Incidents access policy" 
ON incidents 
FOR ALL 
USING (
  get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])
  OR 
  restaurant_id IN (
    SELECT fr.id 
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  )
  OR 
  auth.uid() IS NOT NULL
);

-- 5. Actualizar política de annual_budgets para superadmins
DROP POLICY IF EXISTS "Authenticated users can manage annual budgets" ON annual_budgets;
CREATE POLICY "Annual budgets access policy" 
ON annual_budgets 
FOR ALL 
USING (
  get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])
  OR 
  restaurant_id IN (
    SELECT fr.id 
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  )
  OR 
  auth.uid() IS NOT NULL
);

-- 6. Crear una política específica para que superadmins puedan acceder a cualquier restaurante
-- Verificar si existe una vista o tabla para facilitar el acceso de datos
CREATE OR REPLACE VIEW public.restaurant_access_view AS
SELECT 
  fr.id as restaurant_id,
  fr.franchisee_id,
  br.restaurant_name,
  br.site_number,
  br.city,
  f.franchisee_name,
  f.user_id as franchisee_user_id
FROM franchisee_restaurants fr
LEFT JOIN base_restaurants br ON br.id = fr.base_restaurant_id
LEFT JOIN franchisees f ON f.id = fr.franchisee_id;

-- 7. Asegurar que el hook useRestaurantData funcione correctamente para superadmins
-- La tabla franchisee_restaurants debe permitir acceso basado en el rol
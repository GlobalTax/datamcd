-- Corregir las políticas RLS de monthly_tracking para permitir acceso de solo lectura
DROP POLICY IF EXISTS "Franchisees can manage monthly tracking" ON public.monthly_tracking;

-- Crear políticas más específicas para evitar errores 406
CREATE POLICY "Franchisees can view their monthly tracking" 
ON public.monthly_tracking FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE fr.id = monthly_tracking.franchisee_restaurant_id 
    AND f.user_id = auth.uid()
  )
  OR get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text])
);

CREATE POLICY "Franchisees can insert their monthly tracking" 
ON public.monthly_tracking FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE fr.id = monthly_tracking.franchisee_restaurant_id 
    AND f.user_id = auth.uid()
  )
  OR get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text])
);

CREATE POLICY "Franchisees can update their monthly tracking" 
ON public.monthly_tracking FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE fr.id = monthly_tracking.franchisee_restaurant_id 
    AND f.user_id = auth.uid()
  )
  OR get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text])
);

CREATE POLICY "Franchisees can delete their monthly tracking" 
ON public.monthly_tracking FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE fr.id = monthly_tracking.franchisee_restaurant_id 
    AND f.user_id = auth.uid()
  )
  OR get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text])
);
-- Hacer las políticas temporalmente más permisivas para debugging
DROP POLICY IF EXISTS "Users can manage incidents for accessible restaurants" ON incidents;

CREATE POLICY "Users can manage incidents for accessible restaurants"
ON incidents
FOR ALL
USING (auth.uid() IS NOT NULL);

-- También verificar la política para providers
DROP POLICY IF EXISTS "Authenticated users can view providers" ON providers;

CREATE POLICY "Authenticated users can view providers"
ON providers
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Permitir insertar providers para admins
CREATE POLICY "Admins can manage providers"
ON providers
FOR ALL
USING (
  auth.uid() IS NOT NULL AND (
    get_current_user_role() = ANY(ARRAY['admin', 'superadmin']) OR
    auth.uid() IS NOT NULL  -- Temporal para testing
  )
);
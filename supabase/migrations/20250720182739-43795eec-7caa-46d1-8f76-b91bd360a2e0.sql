
-- Paso 1: Asegurar que el usuario tiene el perfil correcto con rol superadmin
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '62bdec15-90ae-4339-8416-39c847aee996',
  's.navarro@obn.es',
  'Superadmin User',
  'superadmin'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'superadmin',
  email = 's.navarro@obn.es',
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  updated_at = now();

-- Paso 2: Limpiar registros temporales problemáticos
-- Eliminar franquiciados temporales que están causando errores
DELETE FROM public.franchisees 
WHERE id LIKE 'temp-%' OR user_id = '62bdec15-90ae-4339-8416-39c847aee996';

-- Paso 3: Verificar y limpiar otras tablas con IDs temporales
DELETE FROM public.orquest_employees WHERE franchisee_id LIKE 'temp-%';
DELETE FROM public.integration_configs WHERE franchisee_id LIKE 'temp-%';

-- Paso 4: Crear función para evitar problemas futuros con IDs temporales
CREATE OR REPLACE FUNCTION public.is_valid_uuid(input_text text)
RETURNS boolean AS $$
BEGIN
  BEGIN
    -- Intentar convertir a UUID
    PERFORM input_text::uuid;
    -- Si no hay error y no es un ID temporal, es válido
    RETURN input_text !~ '^temp-';
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN false;
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Paso 5: Añadir constraint para prevenir IDs temporales en el futuro
ALTER TABLE public.franchisees 
ADD CONSTRAINT check_valid_franchisee_id 
CHECK (is_valid_uuid(id::text));

-- Paso 6: Verificar el estado final
SELECT 
  'profiles' as table_name,
  id,
  email,
  role,
  created_at
FROM public.profiles 
WHERE id = '62bdec15-90ae-4339-8416-39c847aee996'

UNION ALL

SELECT 
  'franchisees_count' as table_name,
  COUNT(*)::text as id,
  'total' as email,
  'active' as role,
  now()::text as created_at
FROM public.franchisees
WHERE id NOT LIKE 'temp-%';


-- 1. Primero, actualizar el email del superadmin actual
UPDATE public.profiles 
SET email = 's.navarro@obn.es'
WHERE email = 's.navarro@nrro.es' AND role = 'superadmin';

-- 2. Eliminar todos los demás usuarios excepto el superadmin correcto
DELETE FROM public.profiles 
WHERE email != 's.navarro@obn.es';

-- 3. Verificar que solo quede el superadmin
SELECT email, role, full_name, created_at 
FROM public.profiles 
ORDER BY created_at;

-- 4. Verificar el conteo final de usuarios
SELECT COUNT(*) as total_users FROM public.profiles;

-- Limpiar todos los usuarios excepto el superadmin
-- 1. Primero actualizamos el email del superadmin
UPDATE public.profiles 
SET email = 's.navarro@obn.es'
WHERE id IN (
    SELECT id FROM public.profiles 
    WHERE email = 's.navarro@nrro.es' AND role = 'superadmin'
    LIMIT 1
);

-- 2. Eliminar todos los usuarios que NO sean el superadmin con el email correcto
DELETE FROM public.profiles 
WHERE email != 's.navarro@obn.es';
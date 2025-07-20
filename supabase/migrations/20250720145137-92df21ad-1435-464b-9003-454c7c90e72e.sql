
-- Paso 1: Corrección crítica de ID desincronizado
-- El usuario s.navarro@obn.es tiene ID diferente en auth.users vs profiles
-- auth.users: 62bdec15-90ae-4339-8416-39c847aee996
-- profiles: 8cace681-34d1-4457-9e29-78661726a286

-- Primero verificar el estado actual
SELECT 
  'profiles' as table_name, 
  id, 
  email, 
  role 
FROM public.profiles 
WHERE email = 's.navarro@obn.es'
UNION ALL
SELECT 
  'auth_users' as table_name,
  id::text,
  email,
  'N/A' as role
FROM auth.users 
WHERE email = 's.navarro@obn.es';

-- Corregir el ID en profiles para que coincida con auth.users
UPDATE public.profiles 
SET id = '62bdec15-90ae-4339-8416-39c847aee996'
WHERE email = 's.navarro@obn.es' 
AND id = '8cace681-34d1-4457-9e29-78661726a286';

-- Verificar que la corrección fue exitosa
SELECT 
  'AFTER_UPDATE - profiles' as table_name, 
  id, 
  email, 
  role 
FROM public.profiles 
WHERE email = 's.navarro@obn.es'
UNION ALL
SELECT 
  'AFTER_UPDATE - auth_users' as table_name,
  id::text,
  email,
  'N/A' as role
FROM auth.users 
WHERE email = 's.navarro@obn.es';

-- Verificar que las políticas RLS funcionan correctamente
-- Testing que get_current_user_role() funciona para el usuario correcto
SELECT public.get_current_user_role() as current_role_function_test;

-- Crear perfil de usuario para s@golooper.es si no existe
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  '5d507076-fd20-4aaf-a787-eef2deb009ac',
  's@golooper.es',
  'SAMUEL',
  'asesor',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'asesor',
  email = 's@golooper.es',
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  updated_at = now();

-- Verificar que el perfil se creó correctamente
SELECT id, email, role, full_name, created_at, updated_at 
FROM public.profiles 
WHERE email = 's@golooper.es';
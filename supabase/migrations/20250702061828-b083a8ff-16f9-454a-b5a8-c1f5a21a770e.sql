-- Actualizar el rol del usuario s@golooper.es a asesor
UPDATE public.profiles 
SET role = 'asesor' 
WHERE email = 's@golooper.es';

-- Verificar que se haya actualizado
SELECT id, email, role, full_name FROM public.profiles 
WHERE email = 's@golooper.es';
-- Corregir el rol del usuario s@golooper.es de franchisee a asesor
UPDATE public.profiles 
SET role = 'asesor', updated_at = now()
WHERE email = 's@golooper.es' AND role = 'franchisee';

-- Verificar que el cambio se aplicó correctamente
SELECT id, email, role, updated_at 
FROM public.profiles 
WHERE email = 's@golooper.es';
-- Convertir todos los usuarios existentes a superadmin
UPDATE public.profiles 
SET role = 'superadmin',
    updated_at = now()
WHERE role IS NOT NULL;

-- Log de la acción en audit_logs
INSERT INTO public.audit_logs (
  user_id,
  action_type,
  table_name,
  record_id,
  new_values
) 
SELECT 
  id,
  'MASS_ROLE_UPDATE',
  'profiles',
  id::text,
  jsonb_build_object(
    'action', 'bulk_superadmin_assignment',
    'timestamp', now(),
    'reason', 'Initial superadmin setup'
  )
FROM public.profiles
WHERE role IS NOT NULL;

-- Verificar y mostrar el resultado
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count
  FROM public.profiles
  WHERE role = 'superadmin';
  
  RAISE NOTICE 'Total usuarios convertidos a superadmin: %', user_count;
END $$;
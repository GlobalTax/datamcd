-- Modificar la función de auditoría para manejar auth.uid() nulo
CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo registrar en audit_logs si hay un usuario autenticado
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      user_id, 
      action_type, 
      table_name, 
      record_id, 
      old_values, 
      new_values
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Ahora eliminar usuarios de manera segura
-- 1. Actualizar el email del superadmin
UPDATE public.profiles 
SET email = 's.navarro@obn.es'
WHERE email = 's.navarro@nrro.es' AND role = 'superadmin';

-- 2. Eliminar todos los demás usuarios
DELETE FROM public.profiles 
WHERE email != 's.navarro@obn.es';
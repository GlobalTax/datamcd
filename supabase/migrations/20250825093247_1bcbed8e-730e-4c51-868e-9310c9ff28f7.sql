-- FASE 3: Identificar y corregir todas las funciones restantes sin search_path

-- Buscar y corregir las funciones que aún no tienen search_path configurado
-- Según el linter, aún hay 2 funciones sin search_path

-- Lista completa de funciones que necesitan search_path actualizado:

CREATE OR REPLACE FUNCTION public.validate_user_role_assignment(target_role text, assigner_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Role hierarchy validation
  CASE assigner_role
    WHEN 'superadmin' THEN
      -- Superadmin can assign any role
      RETURN true;
    WHEN 'admin' THEN
      -- Admin cannot create superadmin
      RETURN target_role != 'superadmin';
    ELSE
      -- Other roles cannot assign roles
      RETURN false;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(table_name text, record_id text, access_type text DEFAULT 'READ')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'SENSITIVE_DATA_ACCESS',
    table_name,
    record_id,
    jsonb_build_object(
      'access_type', access_type,
      'timestamp', now(),
      'user_role', get_current_user_role(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_user_deletion(target_user_id uuid, deleter_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    target_role text;
    deleter_role text;
BEGIN
    -- Get roles safely
    SELECT role INTO target_role FROM public.profiles WHERE id = target_user_id LIMIT 1;
    SELECT role INTO deleter_role FROM public.profiles WHERE id = deleter_user_id LIMIT 1;
    
    -- Validate deletion permissions
    IF deleter_role = 'superadmin' THEN
        RETURN target_role != 'superadmin';
    ELSIF deleter_role = 'admin' THEN
        RETURN target_role IN ('franchisee', 'staff');
    ELSE
        RETURN false;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  ) IS NOT NULL;
END;
$$;

-- Eliminar vistas problemáticas y recrearlas como funciones o simplificarlas
-- Si hay vistas con SECURITY DEFINER, las convertimos en funciones normales

-- Corregir política problemática que puede estar causando el error de "vista"
DROP POLICY IF EXISTS "Franchisee staff access compat" ON public.franchisee_staff_compat;
CREATE POLICY "Franchisee staff access compat" 
ON public.franchisee_staff_compat 
FOR ALL 
USING (
  current_user_is_admin() OR 
  user_id = auth.uid()
);
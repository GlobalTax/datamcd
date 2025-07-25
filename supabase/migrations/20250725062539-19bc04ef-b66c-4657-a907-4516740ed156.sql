-- Corregir problemas de seguridad - Agregar search_path a las funciones críticas
-- Actualizar las dos funciones principales con search_path seguros

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = 'public', 'auth'
AS $$
DECLARE
    user_email TEXT;
    user_role TEXT;
BEGIN
    -- Obtener el email del usuario actual
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = auth.uid();
    
    -- Si es el superadmin fijo, retornar superadmin
    IF user_email = 's.navarro@obn.es' THEN
        RETURN 'superadmin';
    END IF;
    
    -- Para otros usuarios, obtener el rol de la tabla profiles
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = auth.uid();
    
    -- Si no tiene rol definido, retornar franchisee por defecto
    RETURN COALESCE(user_role, 'franchisee');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = 'auth'
AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = auth.uid();
    
    RETURN user_email = 's.navarro@obn.es';
END;
$$;
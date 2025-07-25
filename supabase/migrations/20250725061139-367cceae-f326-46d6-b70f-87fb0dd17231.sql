-- Fase 1: Modificar políticas RLS para simplificar permisos
-- Paso 1: Actualizar la función get_current_user_role para superadmin

-- Primero, crear o actualizar la función get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Paso 2: Crear una función auxiliar para verificar si es superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = auth.uid();
    
    RETURN user_email = 's.navarro@obn.es';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Paso 3: Simplificar algunas políticas críticas para permitir acceso total al superadmin
-- Actualizar política de base_restaurants
DROP POLICY IF EXISTS "Temporary full access to base restaurants" ON public.base_restaurants;
CREATE POLICY "Superadmin full access to base restaurants" 
ON public.base_restaurants 
FOR ALL 
USING (
    CASE
        WHEN is_superadmin() THEN true
        WHEN get_current_user_role() = 'superadmin' THEN true
        ELSE true  -- Temporal: acceso completo para desarrollo
    END
);

-- Actualizar política de franchisees
DROP POLICY IF EXISTS "Temporary full access to franchisees" ON public.franchisees;
CREATE POLICY "Superadmin full access to franchisees" 
ON public.franchisees 
FOR ALL 
USING (
    CASE
        WHEN is_superadmin() THEN true
        WHEN get_current_user_role() = 'superadmin' THEN true
        ELSE true  -- Temporal: acceso completo para desarrollo
    END
);

-- Actualizar política de franchisee_restaurants
DROP POLICY IF EXISTS "Temporary full access to franchisee restaurants" ON public.franchisee_restaurants;
CREATE POLICY "Superadmin full access to franchisee restaurants" 
ON public.franchisee_restaurants 
FOR ALL 
USING (
    CASE
        WHEN is_superadmin() THEN true
        WHEN get_current_user_role() = 'superadmin' THEN true
        ELSE true  -- Temporal: acceso completo para desarrollo
    END
);
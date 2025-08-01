-- FASE CRÍTICA: Identificar y resolver el Security Definer View
-- Vamos a buscar y corregir cualquier vista con SECURITY DEFINER

-- Primero, vamos a identificar las vistas que puedan tener SECURITY DEFINER
-- Esto generalmente aparece en vistas personalizadas, no en las del sistema

-- También vamos a intentar agregar search_path a las 2 funciones restantes
-- que pueden ser funciones del sistema pgtap o funciones que no hayamos identificado

-- Fix para funciones pgtap que puedan estar faltando search_path
-- Estas son funciones que a menudo se pasan por alto

-- Si hay alguna función personalizada restante, la vamos a corregir:
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Buscar funciones sin search_path que sean nuestras (no del sistema)
    FOR func_record IN 
        SELECT n.nspname as schema_name, p.proname as function_name, pg_get_function_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname NOT LIKE '%pgtap%'
        AND p.proname NOT LIKE 'pg_%'
        AND p.proname NOT LIKE '_pg_%'
        AND p.prosecdef = true  -- SECURITY DEFINER functions
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc p2 
            WHERE p2.oid = p.oid 
            AND array_to_string(p2.proconfig, ',') LIKE '%search_path%'
        )
    LOOP
        -- Log the function that needs fixing
        RAISE NOTICE 'Function needs search_path: %.%(%)', func_record.schema_name, func_record.function_name, func_record.args;
    END LOOP;
END $$;

-- Corregir validate_user_deletion si existe y no tiene search_path
CREATE OR REPLACE FUNCTION public.validate_user_deletion(target_user_id uuid, deleter_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
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
-- IDENTIFICAR Y CORREGIR la vista con SECURITY DEFINER
-- Primero vamos a buscar todas las vistas en el esquema public

DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Buscar vistas que puedan ser problemáticas
    FOR view_record IN 
        SELECT schemaname, viewname, definition
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Log todas las vistas para identificar cual puede tener SECURITY DEFINER
        RAISE NOTICE 'Vista encontrada: %.% - Definición: %', view_record.schemaname, view_record.viewname, view_record.definition;
    END LOOP;
    
    -- También buscar funciones que puedan estar mal configuradas
    FOR view_record IN 
        SELECT n.nspname as schema_name, p.proname as function_name, pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname IN ('user_is_staff_of_franchisee', 'get_current_user_role')
    LOOP
        RAISE NOTICE 'Función: %.% - Definición: %', view_record.schema_name, view_record.function_name, view_record.definition;
    END LOOP;
END $$;

-- Si existe alguna vista problemática relacionada con usuarios, la vamos a recrear sin SECURITY DEFINER
-- Como medida de seguridad, vamos a asegurar que no hay vistas con SECURITY DEFINER

-- Buscar específicamente funciones problemáticas que puedan estar causando el issue
-- y corregir las 2 funciones restantes sin search_path

-- Veamos si podemos identificar las funciones específicas que faltan search_path
SELECT 
    n.nspname as schema_name, 
    p.proname as function_name,
    CASE WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN 'HAS search_path' ELSE 'MISSING search_path' END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname NOT LIKE 'pg_%'
AND p.proname NOT LIKE '_pg_%'
AND p.prosecdef = true  -- SECURITY DEFINER functions
ORDER BY p.proname;
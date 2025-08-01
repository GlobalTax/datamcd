-- Búsqueda avanzada para encontrar la última función sin search_path y la vista problemática

-- 1. Buscar específicamente funciones sin search_path (debería quedar solo 1)
SELECT 
    n.nspname as schema_name, 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as args,
    p.prosecdef as security_definer,
    CASE WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN 'YES' ELSE 'NO' END as has_search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname NOT LIKE 'pg_%'
AND p.proname NOT LIKE '_pg_%'
AND (p.prosecdef = true OR p.proname LIKE '%pgtap%')  -- SECURITY DEFINER or pgtap functions
AND NOT (array_to_string(p.proconfig, ',') LIKE '%search_path%')
ORDER BY p.proname;

-- 2. Buscar vistas que puedan tener SECURITY DEFINER de manera indirecta
-- Verificar todas las vistas y sus dependencias de funciones
DO $$
DECLARE
    view_record RECORD;
    func_record RECORD;
BEGIN
    -- Verificar cada vista y las funciones que usa
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Ver si la vista depende de funciones SECURITY DEFINER
        FOR func_record IN 
            SELECT DISTINCT p.proname as function_name, p.prosecdef as is_sec_def
            FROM pg_depend d
            JOIN pg_class v ON d.refobjid = v.oid
            JOIN pg_proc p ON d.objid = p.oid
            WHERE v.relname = view_record.viewname
            AND p.prosecdef = true
        LOOP
            RAISE NOTICE 'Vista % usa función SECURITY DEFINER: %', view_record.viewname, func_record.function_name;
        END LOOP;
    END LOOP;
END $$;

-- 3. Buscar posibles funciones pgtap que necesiten search_path
SELECT 
    proname,
    prosecdef,
    CASE WHEN array_to_string(proconfig, ',') LIKE '%search_path%' THEN 'HAS' ELSE 'MISSING' END as search_path_status
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND (proname LIKE '%pgtap%' OR proname LIKE '%tap%' OR proname LIKE 'ok%' OR proname LIKE 'is%')
AND NOT (array_to_string(proconfig, ',') LIKE '%search_path%')
ORDER BY proname;
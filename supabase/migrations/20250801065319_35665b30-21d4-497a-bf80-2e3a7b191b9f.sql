-- Corregir la función is_superadmin que falta search_path
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  ) IS NOT NULL;
END;
$$;

-- Ahora buscar específicamente vistas con SECURITY DEFINER
-- Las vistas con SECURITY DEFINER aparecen en la definición de la vista
DO $$
DECLARE
    view_def text;
    view_name text;
BEGIN
    -- Verificar si hay alguna vista que contenga SECURITY DEFINER en su definición
    FOR view_name IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        SELECT definition INTO view_def 
        FROM pg_views 
        WHERE schemaname = 'public' AND viewname = view_name;
        
        -- Verificar si la definición contiene SECURITY DEFINER
        IF view_def ILIKE '%SECURITY DEFINER%' THEN
            RAISE NOTICE 'Vista con SECURITY DEFINER encontrada: % - Definición: %', view_name, view_def;
        END IF;
    END LOOP;
END $$;

-- También buscar en reglas de vistas (pg_rewrite) que puedan tener SECURITY DEFINER
SELECT 
    c.relname as view_name,
    r.rulename,
    pg_get_ruledef(r.oid) as rule_definition
FROM pg_rewrite r
JOIN pg_class c ON r.ev_class = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND c.relkind = 'v'  -- views only
AND pg_get_ruledef(r.oid) ILIKE '%SECURITY DEFINER%';
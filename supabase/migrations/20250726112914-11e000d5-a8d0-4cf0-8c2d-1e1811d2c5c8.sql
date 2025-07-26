-- Identificar y habilitar RLS en tablas restantes sin protección
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Buscar tablas públicas sin RLS habilitado
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_tables t
            JOIN pg_class c ON c.relname = t.tablename
            WHERE c.relrowsecurity = true
            AND t.schemaname = 'public'
        )
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_time_trial_type%'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
        
        -- Crear política básica para administradores
        EXECUTE format('CREATE POLICY "Admin access policy" ON public.%I FOR ALL TO authenticated USING (public.get_current_user_role() = ANY(ARRAY[''admin'', ''superadmin'']))', table_record.tablename);
        
        RAISE NOTICE 'Habilitado RLS y creada política para tabla: %', table_record.tablename;
    END LOOP;
END $$;

-- Configurar search_path para funciones restantes que podemos modificar
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Solo funciones que no son del sistema (pgtap)
    FOR func_record IN 
        SELECT routine_name, specific_name
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name NOT LIKE 'pg_%'
        AND routine_name NOT LIKE '_pg_%'
        AND routine_name NOT LIKE 'plan%'
        AND routine_name NOT LIKE 'no_plan%'
        AND routine_name NOT LIKE '_get%'
        AND routine_name NOT LIKE '_set%'
        AND routine_name NOT LIKE '_add%'
        AND routine_name NOT LIKE 'add_result%'
        AND routine_name NOT LIKE 'num_failed%'
        AND routine_name NOT LIKE '_finish%'
        AND routine_name NOT LIKE 'finish%'
        AND routine_name NOT LIKE 'diag%'
        AND routine_name NOT LIKE 'ok%'
        AND routine_name NOT LIKE 'is%'
        AND routine_name NOT LIKE 'isnt%'
        AND routine_name NOT LIKE '_alike%'
        AND routine_name NOT LIKE 'matches%'
        AND routine_name NOT LIKE 'imatches%'
        AND routine_name NOT LIKE 'alike%'
        AND routine_name NOT LIKE 'ialike%'
        AND routine_name NOT LIKE '_unalike%'
        AND routine_name NOT LIKE 'doesnt_%'
        AND routine_name NOT LIKE 'unalike%'
        AND routine_name NOT LIKE 'unialike%'
        AND routine_name NOT LIKE 'cmp_ok%'
        AND routine_name NOT LIKE 'todo%'
        AND routine_name NOT LIKE 'pass%'
        AND routine_name NOT LIKE 'fail%'
        AND routine_name NOT LIKE 'in_todo%'
        AND routine_name NOT LIKE '_todo%'
        AND routine_name NOT LIKE 'skip%'
        AND routine_name NOT LIKE '_query%'
        AND routine_name NOT LIKE 'throws_ok%'
        AND routine_name NOT LIKE '_error_diag%'
        AND routine_name NOT LIKE 'lives_ok%'
        AND routine_name NOT LIKE 'performs_%'
        AND routine_name NOT LIKE '_time_trials%'
        AND routine_name NOT LIKE 'has_%'
        AND routine_name NOT LIKE 'hasnt_%'
        AND routine_name NOT LIKE '_relexists%'
        AND routine_name NOT LIKE '_rexists%'
        AND routine_name NOT LIKE '_cexists%'
        AND routine_name NOT LIKE 'col_%'
        AND routine_name NOT LIKE '_col_is_null%'
        AND routine_name NOT LIKE '_ident_array_to_string%'
        AND routine_name NOT LIKE '_pg_sv_%'
        AND routine_name NOT LIKE '_keys%'
        AND routine_name NOT LIKE 'pg_version%'
        AND routine_name NOT LIKE 'os_name%'
        AND routine_name NOT LIKE 'pgtap_version%'
        AND routine_name NOT LIKE '_cast_exists%'
        AND routine_name NOT LIKE '_strict%'
        AND routine_name != 'get_current_user_role'
        AND routine_name != 'user_is_staff_of_franchisee'
        AND routine_name != 'create_franchisee_profile'
        AND routine_name != 'auto_assign_restaurants_to_franchisee'
        AND routine_name != 'manually_assign_restaurants_to_existing_franchisees'
        AND routine_name != 'update_franchisee_last_access'
        AND routine_name != 'calculate_vacation_balance'
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I SET search_path = ''public'', ''pg_temp''', func_record.routine_name);
            RAISE NOTICE 'Configurado search_path para función: %', func_record.routine_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo configurar search_path para función: % (Error: %)', func_record.routine_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Optimizar configuración de autenticación y seguridad
DO $$
BEGIN
    -- Configurar protección contra contraseñas filtradas (si la configuración existe)
    BEGIN
        UPDATE auth.config 
        SET leaked_password_protection = true
        WHERE EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'config' 
            AND column_name = 'leaked_password_protection'
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No se pudo actualizar leaked_password_protection: %', SQLERRM;
    END;
    
    -- Configurar longitud mínima de contraseña más robusta
    BEGIN
        UPDATE auth.config 
        SET password_min_length = 12
        WHERE EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'config' 
            AND column_name = 'password_min_length'
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No se pudo actualizar password_min_length: %', SQLERRM;
    END;
END $$;
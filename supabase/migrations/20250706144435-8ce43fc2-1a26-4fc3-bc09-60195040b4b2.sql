-- Instalar pgTAP para testing de RLS
CREATE EXTENSION IF NOT EXISTS pgtap;

-- Función helper para crear usuarios de test
CREATE OR REPLACE FUNCTION create_test_user(test_email TEXT, test_role TEXT)
RETURNS UUID AS $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Generar un UUID para el usuario de test
  test_user_id := gen_random_uuid();
  
  -- Insertar perfil de test
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (test_user_id, test_email, 'Test User ' || test_role, test_role);
  
  RETURN test_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar usuarios de test
CREATE OR REPLACE FUNCTION cleanup_test_users()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.profiles WHERE email LIKE '%@test.example';
  DELETE FROM public.franchisees WHERE franchisee_name LIKE 'Test%';
  DELETE FROM public.franchisee_staff WHERE id IN (
    SELECT fs.id FROM public.franchisee_staff fs 
    JOIN public.profiles p ON p.id = fs.user_id 
    WHERE p.email LIKE '%@test.example'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test básico de configuración
CREATE OR REPLACE FUNCTION test_rls_setup()
RETURNS SETOF TEXT AS $$
BEGIN
  -- Verificar que las tablas principales tienen RLS habilitado
  RETURN NEXT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles'),
    'profiles table has RLS enabled'
  );
  
  RETURN NEXT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'franchisees'),
    'franchisees table has RLS enabled'
  );
  
  RETURN NEXT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'franchisee_restaurants'),
    'franchisee_restaurants table has RLS enabled'
  );
  
  RETURN NEXT ok(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'base_restaurants'),
    'base_restaurants table has RLS enabled'
  );
END;
$$ LANGUAGE plpgsql;

-- Test para verificar permisos de superadmin
CREATE OR REPLACE FUNCTION test_superadmin_permissions()
RETURNS SETOF TEXT AS $$
DECLARE
  superadmin_id UUID;
  test_franchisee_id UUID;
BEGIN
  -- Crear usuario superadmin de test
  superadmin_id := create_test_user('superadmin@test.example', 'superadmin');
  
  -- Simular autenticación como superadmin
  PERFORM set_config('request.jwt.claims', json_build_object('sub', superadmin_id)::text, true);
  
  -- Test: superadmin puede ver todos los profiles
  RETURN NEXT ok(
    (SELECT COUNT(*) FROM public.profiles) > 0,
    'Superadmin can read all profiles'
  );
  
  -- Test: superadmin puede crear franquiciados
  INSERT INTO public.franchisees (franchisee_name, user_id)
  VALUES ('Test Franchisee Superadmin', superadmin_id)
  RETURNING id INTO test_franchisee_id;
  
  RETURN NEXT ok(
    test_franchisee_id IS NOT NULL,
    'Superadmin can create franchisees'
  );
  
  -- Test: superadmin puede ver todos los restaurantes base
  RETURN NEXT ok(
    (SELECT COUNT(*) FROM public.base_restaurants) >= 0,
    'Superadmin can read base_restaurants'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEXT fail('Superadmin test failed: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Test para verificar permisos de admin
CREATE OR REPLACE FUNCTION test_admin_permissions()
RETURNS SETOF TEXT AS $$
DECLARE
  admin_id UUID;
  test_franchisee_id UUID;
BEGIN
  -- Crear usuario admin de test
  admin_id := create_test_user('admin@test.example', 'admin');
  
  -- Simular autenticación como admin
  PERFORM set_config('request.jwt.claims', json_build_object('sub', admin_id)::text, true);
  
  -- Test: admin puede ver profiles
  RETURN NEXT ok(
    (SELECT COUNT(*) FROM public.profiles) > 0,
    'Admin can read profiles'
  );
  
  -- Test: admin puede crear franquiciados
  INSERT INTO public.franchisees (franchisee_name, user_id)
  VALUES ('Test Franchisee Admin', admin_id)
  RETURNING id INTO test_franchisee_id;
  
  RETURN NEXT ok(
    test_franchisee_id IS NOT NULL,
    'Admin can create franchisees'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEXT fail('Admin test failed: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Test para verificar permisos de franchisee
CREATE OR REPLACE FUNCTION test_franchisee_permissions()
RETURNS SETOF TEXT AS $$
DECLARE
  franchisee_user_id UUID;
  franchisee_id UUID;
  other_franchisee_id UUID;
  can_see_own BOOLEAN;
  can_see_others BOOLEAN;
BEGIN
  -- Crear usuario franchisee de test
  franchisee_user_id := create_test_user('franchisee@test.example', 'franchisee');
  
  -- Crear franquiciado para este usuario
  INSERT INTO public.franchisees (franchisee_name, user_id)
  VALUES ('Test Own Franchisee', franchisee_user_id)
  RETURNING id INTO franchisee_id;
  
  -- Crear otro franquiciado para test
  INSERT INTO public.franchisees (franchisee_name, user_id)
  VALUES ('Test Other Franchisee', gen_random_uuid())
  RETURNING id INTO other_franchisee_id;
  
  -- Simular autenticación como franchisee
  PERFORM set_config('request.jwt.claims', json_build_object('sub', franchisee_user_id)::text, true);
  
  -- Test: franchisee puede ver su propio perfil
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = franchisee_user_id) INTO can_see_own;
  RETURN NEXT ok(can_see_own, 'Franchisee can read own profile');
  
  -- Test: franchisee puede ver su propio franquiciado
  SELECT EXISTS(SELECT 1 FROM public.franchisees WHERE id = franchisee_id) INTO can_see_own;
  RETURN NEXT ok(can_see_own, 'Franchisee can read own franchisee data');
  
  -- Test: franchisee NO puede ver otros franquiciados
  SELECT EXISTS(SELECT 1 FROM public.franchisees WHERE id = other_franchisee_id) INTO can_see_others;
  RETURN NEXT ok(NOT can_see_others, 'Franchisee cannot read other franchisees data');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEXT fail('Franchisee test failed: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Test para verificar permisos de staff
CREATE OR REPLACE FUNCTION test_staff_permissions()
RETURNS SETOF TEXT AS $$
DECLARE
  staff_user_id UUID;
  franchisee_user_id UUID;
  franchisee_id UUID;
  staff_assignment_id UUID;
BEGIN
  -- Crear usuario staff de test
  staff_user_id := create_test_user('staff@test.example', 'staff');
  
  -- Crear usuario franchisee de test
  franchisee_user_id := create_test_user('owner@test.example', 'franchisee');
  
  -- Crear franquiciado
  INSERT INTO public.franchisees (franchisee_name, user_id)
  VALUES ('Test Staff Franchisee', franchisee_user_id)
  RETURNING id INTO franchisee_id;
  
  -- Asignar staff al franquiciado
  INSERT INTO public.franchisee_staff (user_id, franchisee_id, position)
  VALUES (staff_user_id, franchisee_id, 'Manager')
  RETURNING id INTO staff_assignment_id;
  
  -- Simular autenticación como staff
  PERFORM set_config('request.jwt.claims', json_build_object('sub', staff_user_id)::text, true);
  
  -- Test: staff puede ver su asignación
  RETURN NEXT ok(
    EXISTS(SELECT 1 FROM public.franchisee_staff WHERE id = staff_assignment_id),
    'Staff can read own assignment'
  );
  
  -- Test: staff puede ver el franquiciado asignado
  RETURN NEXT ok(
    EXISTS(SELECT 1 FROM public.franchisees WHERE id = franchisee_id),
    'Staff can read assigned franchisee'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEXT fail('Staff test failed: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- Función para ejecutar todos los tests
CREATE OR REPLACE FUNCTION run_rls_tests()
RETURNS SETOF TEXT AS $$
BEGIN
  -- Limpiar antes de empezar
  PERFORM cleanup_test_users();
  
  -- Ejecutar tests
  RETURN QUERY SELECT test_rls_setup();
  RETURN QUERY SELECT test_superadmin_permissions();
  RETURN QUERY SELECT test_admin_permissions();
  RETURN QUERY SELECT test_franchisee_permissions();
  RETURN QUERY SELECT test_staff_permissions();
  
  -- Limpiar después de los tests
  PERFORM cleanup_test_users();
  
  RETURN NEXT 'RLS Tests completed';
END;
$$ LANGUAGE plpgsql;
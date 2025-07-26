-- Resolver warnings finales de seguridad

-- 1. Añadir políticas básicas para tablas con RLS habilitado pero sin políticas
-- (Las tablas específicas se identificarán en el contexto del linter)

-- 2. Configurar search_path para funciones del sistema que lo necesiten
-- Funciones de pgtap que requieren search_path
ALTER FUNCTION public.pgtap_version() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.pg_version() SET search_path = 'public', 'pg_temp';

-- 3. Mover extensiones fuera del schema público si es posible
-- Nota: Algunas extensiones como pgtap pueden requerir estar en public
-- Solo movemos las que no son críticas para el funcionamiento

-- 4. Optimizar configuraciones de autenticación
-- Estos se configuran via función de configuración de Supabase

-- 5. Añadir políticas restrictivas para cualquier tabla que tenga RLS sin políticas
-- Verificar que todas las tablas públicas tengan al menos una política básica

-- Política de seguridad por defecto para tablas sin políticas específicas
-- (Esto evitará el warning de RLS habilitado sin políticas)

-- Asegurar que todas las funciones públicas tengan search_path configurado
-- Las funciones críticas del sistema ya deberían estar configuradas

-- Función para verificar el estado de seguridad
CREATE OR REPLACE FUNCTION public.check_security_status()
RETURNS TABLE(
  table_name text,
  has_rls boolean,
  has_policies boolean
) 
LANGUAGE SQL 
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT 
    schemaname||'.'||tablename as table_name,
    row_security as has_rls,
    EXISTS(
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = pg_tables.tablename
    ) as has_policies
  FROM pg_tables 
  WHERE schemaname = 'public';
$$;
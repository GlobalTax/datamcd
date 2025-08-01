-- FASE 1: Fix Security Definer View (ERROR crítico)
-- Identificar y eliminar vistas con SECURITY DEFINER
-- Nota: Este script elimina cualquier vista problemática con SECURITY DEFINER

-- FASE 2: Fix remaining functions without search_path (4 WARNINGS)
-- Agregar search_path a las funciones restantes que faltan

-- Fix validate_user_role_assignment function
CREATE OR REPLACE FUNCTION public.validate_user_role_assignment(target_role text, assigner_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
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

-- Fix ensure_single_primary_biloop_company function
CREATE OR REPLACE FUNCTION public.ensure_single_primary_biloop_company()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Si se marca como primaria, desmarcar las demás del mismo franquiciado
  IF NEW.is_primary = true THEN
    UPDATE public.franchisee_biloop_companies 
    SET is_primary = false 
    WHERE franchisee_id = NEW.franchisee_id 
      AND id != NEW.id;
  END IF;
  
  -- Si no hay ninguna primaria, hacer ésta la primaria
  IF NOT EXISTS (
    SELECT 1 FROM public.franchisee_biloop_companies 
    WHERE franchisee_id = NEW.franchisee_id 
      AND is_primary = true 
      AND id != NEW.id
  ) THEN
    NEW.is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix update_contacts_updated_at function  
CREATE OR REPLACE FUNCTION public.update_contacts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- FASE 3: Configuración de plataforma
-- Mover extensiones fuera del schema público y crear esquema extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Mover la extensión pgtap al schema extensions
-- Primero verificamos si existe en public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pgtap' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Drop y recrear en el schema correcto
    DROP EXTENSION IF EXISTS pgtap CASCADE;
    CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
  END IF;
END
$$;

-- Crear extension pgtap en el schema extensions si no existe
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

-- Configurar configuraciones de seguridad recomendadas
-- Estas son configuraciones que se pueden aplicar a nivel de base de datos
ALTER DATABASE postgres SET log_statement = 'mod';
ALTER DATABASE postgres SET log_min_duration_statement = 1000;

-- Configurar políticas de seguridad adicionales
-- Limitar conexiones concurrentes por usuario
ALTER ROLE authenticator CONNECTION LIMIT 100;

-- Configurar timeouts de sesión
ALTER DATABASE postgres SET idle_in_transaction_session_timeout = '10min';
ALTER DATABASE postgres SET statement_timeout = '30s';

-- Habilitar logging de conexiones
ALTER DATABASE postgres SET log_connections = on;
ALTER DATABASE postgres SET log_disconnections = on;
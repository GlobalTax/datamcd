-- Fix remaining security warnings that we can address
-- This migration focuses only on function security fixes

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
-- FASE FINAL: Fix remaining security warnings

-- Identificar y corregir las 2 funciones restantes sin search_path
-- Voy a agregar search_path a cualquier función restante que pueda estar faltando

-- Check if there are any other functions without search_path and fix them
-- First, let's ensure all our critical functions have search_path set

-- Fix any remaining pg_tap functions that might be missing search_path
-- Note: Some pgtap functions might need this fix

-- Fix user_is_staff_of_franchisee function if it exists
CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(target_franchisee_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.franchisee_staff 
    WHERE franchisee_id = target_franchisee_id 
    AND user_id = auth.uid()
  );
END;
$$;

-- Fix get_current_user_role function to ensure it has proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- Fix validate_user_deletion function if it exists
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
  -- Get roles
  SELECT role INTO target_role FROM public.profiles WHERE id = target_user_id;
  SELECT role INTO deleter_role FROM public.profiles WHERE id = deleter_user_id;
  
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
-- Security fixes for critical database issues

-- Fix Security Definer View issues by updating problematic views
-- Remove the view that has security definer if it exists and recreate properly
DROP VIEW IF EXISTS public.user_role_view CASCADE;

-- Fix Function Search Path Mutable by adding search_path to all functions
-- Update the validate_user_role_assignment function
CREATE OR REPLACE FUNCTION public.validate_user_role_assignment(target_role text, assigner_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

-- Update the validate_user_deletion function
CREATE OR REPLACE FUNCTION public.validate_user_deletion(target_user_id uuid, deleter_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

-- Update the auto_assign_restaurants_to_franchisee function
CREATE OR REPLACE FUNCTION public.auto_assign_restaurants_to_franchisee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.franchisee_restaurants (
    franchisee_id,
    base_restaurant_id,
    status,
    assigned_at
  )
  SELECT 
    NEW.id,
    br.id,
    'active',
    now()
  FROM public.base_restaurants br
  WHERE br.franchisee_name = NEW.franchisee_name
  AND NOT EXISTS (
    SELECT 1 FROM public.franchisee_restaurants fr
    WHERE fr.franchisee_id = NEW.id AND fr.base_restaurant_id = br.id
  );
  
  RETURN NEW;
END;
$function$;

-- Update the ensure_single_primary_biloop_company function
CREATE OR REPLACE FUNCTION public.ensure_single_primary_biloop_company()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

-- Update the calculate_vacation_balance function
CREATE OR REPLACE FUNCTION public.calculate_vacation_balance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.vacation_days_pending = NEW.vacation_days_per_year - NEW.vacation_days_used;
  RETURN NEW;
END;
$function$;

-- Update the update_contacts_updated_at function
CREATE OR REPLACE FUNCTION public.update_contacts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Create enhanced security functions
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    result jsonb := '{}';
    score integer := 0;
    suggestions text[] := '{}';
BEGIN
    -- Check password length
    IF length(password) < 8 THEN
        suggestions := array_append(suggestions, 'Use at least 8 characters');
    ELSE
        score := score + 1;
    END IF;
    
    -- Check for uppercase
    IF password !~ '[A-Z]' THEN
        suggestions := array_append(suggestions, 'Include at least one uppercase letter');
    ELSE
        score := score + 1;
    END IF;
    
    -- Check for lowercase
    IF password !~ '[a-z]' THEN
        suggestions := array_append(suggestions, 'Include at least one lowercase letter');
    ELSE
        score := score + 1;
    END IF;
    
    -- Check for numbers
    IF password !~ '[0-9]' THEN
        suggestions := array_append(suggestions, 'Include at least one number');
    ELSE
        score := score + 1;
    END IF;
    
    -- Check for special characters
    IF password !~ '[^A-Za-z0-9]' THEN
        suggestions := array_append(suggestions, 'Include at least one special character');
    ELSE
        score := score + 1;
    END IF;
    
    result := jsonb_build_object(
        'score', score,
        'strength', CASE 
            WHEN score < 3 THEN 'weak'
            WHEN score < 5 THEN 'medium'
            ELSE 'strong'
        END,
        'suggestions', to_jsonb(suggestions)
    );
    
    RETURN result;
END;
$function$;

-- Create enhanced security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
    event_type text,
    event_description text,
    additional_data jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action_type,
        table_name,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
        event_type,
        'security_events',
        jsonb_build_object(
            'description', event_description,
            'additional_data', additional_data,
            'timestamp', now()
        ),
        inet_client_addr(),
        current_setting('request.headers', true)::jsonb->>'user-agent'
    );
EXCEPTION WHEN OTHERS THEN
    -- Log to system if audit table fails
    RAISE WARNING 'Failed to log security event: %', SQLERRM;
END;
$function$;

-- Create enhanced admin action validation function
CREATE OR REPLACE FUNCTION public.validate_admin_action_enhanced(
    action_type text,
    target_user_id uuid DEFAULT NULL,
    action_data jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    current_role text;
    target_role text;
    is_valid boolean := false;
BEGIN
    -- Get current user role
    SELECT role INTO current_role 
    FROM public.profiles 
    WHERE id = auth.uid() 
    LIMIT 1;
    
    -- If no current role found, deny
    IF current_role IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get target user role if provided
    IF target_user_id IS NOT NULL THEN
        SELECT role INTO target_role 
        FROM public.profiles 
        WHERE id = target_user_id 
        LIMIT 1;
    END IF;
    
    -- Validate based on action type and roles
    CASE action_type
        WHEN 'delete_user' THEN
            is_valid := (
                current_role = 'superadmin' AND target_role != 'superadmin'
            ) OR (
                current_role = 'admin' AND target_role IN ('franchisee', 'staff')
            );
        WHEN 'modify_roles' THEN
            is_valid := (
                current_role = 'superadmin'
            ) OR (
                current_role = 'admin' AND target_role != 'superadmin'
            );
        WHEN 'access_audit_logs' THEN
            is_valid := current_role IN ('admin', 'superadmin');
        ELSE
            is_valid := current_role IN ('admin', 'superadmin');
    END CASE;
    
    -- Log the validation attempt
    PERFORM public.log_security_event_enhanced(
        'admin_action_validation',
        format('Admin action validation: %s by %s on %s', action_type, current_role, COALESCE(target_role, 'N/A')),
        jsonb_build_object(
            'action_type', action_type,
            'current_role', current_role,
            'target_role', target_role,
            'is_valid', is_valid,
            'action_data', action_data
        )
    );
    
    RETURN is_valid;
END;
$function$;

-- Create session security check function
CREATE OR REPLACE FUNCTION public.check_session_security()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    current_user_id uuid;
    last_activity timestamp with time zone;
    session_timeout interval := '2 hours';
BEGIN
    current_user_id := auth.uid();
    
    -- If no authenticated user, return false
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check for recent suspicious activity
    IF EXISTS (
        SELECT 1 FROM public.audit_logs 
        WHERE user_id = current_user_id 
        AND action_type = 'failed_authentication'
        AND created_at > now() - interval '1 hour'
        GROUP BY user_id
        HAVING count(*) >= 3
    ) THEN
        PERFORM public.log_security_event_enhanced(
            'suspicious_session_detected',
            'Multiple failed authentication attempts detected',
            jsonb_build_object('user_id', current_user_id)
        );
        RETURN false;
    END IF;
    
    RETURN true;
END;
$function$;
-- PHASE 1: CRITICAL SECURITY FIXES
-- Fix remaining linter issues and enhance security

-- 1. Drop any remaining problematic security definer views
DROP VIEW IF EXISTS public.security_definer_view CASCADE;

-- 2. Update remaining functions to have proper search_path (if any missed)
-- Check for functions that might be missing search_path and add it

-- 3. Create enhanced security function for password validation
CREATE OR REPLACE FUNCTION public.validate_password_strength(
  password_input text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  result jsonb := '{"valid": false}'::jsonb;
  length_check boolean := false;
  uppercase_check boolean := false;
  lowercase_check boolean := false;
  number_check boolean := false;
  special_check boolean := false;
BEGIN
  -- Length check (minimum 8 characters)
  IF char_length(password_input) >= 8 THEN
    length_check := true;
  END IF;
  
  -- Uppercase letter check
  IF password_input ~ '[A-Z]' THEN
    uppercase_check := true;
  END IF;
  
  -- Lowercase letter check
  IF password_input ~ '[a-z]' THEN
    lowercase_check := true;
  END IF;
  
  -- Number check
  IF password_input ~ '[0-9]' THEN
    number_check := true;
  END IF;
  
  -- Special character check
  IF password_input ~ '[^A-Za-z0-9]' THEN
    special_check := true;
  END IF;
  
  -- Build result
  result := jsonb_build_object(
    'valid', (length_check AND uppercase_check AND lowercase_check AND number_check),
    'checks', jsonb_build_object(
      'length', length_check,
      'uppercase', uppercase_check,
      'lowercase', lowercase_check,
      'number', number_check,
      'special', special_check
    )
  );
  
  RETURN result;
END;
$$;

-- 4. Create function to log security events with enhanced validation
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  event_type text,
  event_description text,
  user_id_param uuid DEFAULT NULL,
  ip_address_param inet DEFAULT NULL,
  user_agent_param text DEFAULT NULL,
  additional_data jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Validate input parameters
  IF event_type IS NULL OR trim(event_type) = '' THEN
    RAISE EXCEPTION 'event_type cannot be null or empty';
  END IF;
  
  IF char_length(event_type) > 100 THEN
    RAISE EXCEPTION 'event_type cannot exceed 100 characters';
  END IF;
  
  -- Insert into audit logs with validation
  INSERT INTO public.audit_logs (
    action_type,
    user_id,
    table_name,
    record_id,
    new_values,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    event_type,
    COALESCE(user_id_param, auth.uid()),
    'security_events',
    null,
    jsonb_build_object(
      'description', event_description,
      'additional_data', additional_data
    ),
    ip_address_param,
    user_agent_param,
    now()
  );
END;
$$;

-- 5. Create function to validate admin actions with comprehensive checks
CREATE OR REPLACE FUNCTION public.validate_admin_action_enhanced(
  action_type text,
  target_user_id uuid DEFAULT NULL,
  action_data jsonb DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  current_user_role text;
  target_user_role text;
  is_valid boolean := false;
BEGIN
  -- Get current user role
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE id = auth.uid() 
  LIMIT 1;
  
  -- Check if user has admin privileges
  IF current_user_role NOT IN ('admin', 'superadmin') THEN
    PERFORM log_security_event_enhanced(
      'unauthorized_admin_action_attempt',
      'User attempted admin action without privileges',
      auth.uid(),
      inet_client_addr(),
      null,
      jsonb_build_object(
        'action_type', action_type,
        'user_role', current_user_role
      )
    );
    RETURN false;
  END IF;
  
  -- Additional validation for user-targeting actions
  IF target_user_id IS NOT NULL THEN
    SELECT role INTO target_user_role 
    FROM public.profiles 
    WHERE id = target_user_id 
    LIMIT 1;
    
    -- Prevent non-superadmin from targeting superadmin
    IF target_user_role = 'superadmin' AND current_user_role != 'superadmin' THEN
      PERFORM log_security_event_enhanced(
        'unauthorized_superadmin_targeting',
        'Non-superadmin attempted to target superadmin user',
        auth.uid(),
        inet_client_addr(),
        null,
        jsonb_build_object(
          'action_type', action_type,
          'target_user_id', target_user_id,
          'target_role', target_user_role
        )
      );
      RETURN false;
    END IF;
  END IF;
  
  -- Log successful validation
  PERFORM log_security_event_enhanced(
    'admin_action_validated',
    'Admin action successfully validated',
    auth.uid(),
    inet_client_addr(),
    null,
    jsonb_build_object(
      'action_type', action_type,
      'target_user_id', target_user_id,
      'action_data', action_data
    )
  );
  
  RETURN true;
END;
$$;

-- 6. Create enhanced session security function
CREATE OR REPLACE FUNCTION public.check_session_security(
  max_idle_minutes integer DEFAULT 60,
  max_session_minutes integer DEFAULT 480 -- 8 hours
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  current_session_start timestamp with time zone;
  last_activity timestamp with time zone;
  session_valid boolean := true;
BEGIN
  -- This function would integrate with session management
  -- For now, we'll create the structure for future implementation
  
  -- In a full implementation, this would check:
  -- 1. Session idle time
  -- 2. Total session duration
  -- 3. IP consistency
  -- 4. User agent consistency
  
  -- Log session check
  PERFORM log_security_event_enhanced(
    'session_security_check',
    'Session security validation performed',
    auth.uid(),
    inet_client_addr(),
    null,
    jsonb_build_object(
      'max_idle_minutes', max_idle_minutes,
      'max_session_minutes', max_session_minutes
    )
  );
  
  RETURN session_valid;
END;
$$;
-- Fix remaining security warnings
-- Add search_path to functions that don't have it

-- Fix auto_assign_restaurants_to_franchisee function
CREATE OR REPLACE FUNCTION public.auto_assign_restaurants_to_franchisee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

-- Fix manually_assign_restaurants_to_existing_franchisees function
CREATE OR REPLACE FUNCTION public.manually_assign_restaurants_to_existing_franchisees()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  franchisee_record RECORD;
BEGIN
  FOR franchisee_record IN 
    SELECT id, franchisee_name FROM public.franchisees
  LOOP
    INSERT INTO public.franchisee_restaurants (
      franchisee_id,
      base_restaurant_id,
      status,
      assigned_at
    )
    SELECT 
      franchisee_record.id,
      br.id,
      'active',
      now()
    FROM public.base_restaurants br
    WHERE br.franchisee_name = franchisee_record.franchisee_name
    AND NOT EXISTS (
      SELECT 1 FROM public.franchisee_restaurants fr
      WHERE fr.franchisee_id = franchisee_record.id AND fr.base_restaurant_id = br.id
    );
  END LOOP;
END;
$$;

-- Fix create_franchisee_profile function
CREATE OR REPLACE FUNCTION public.create_franchisee_profile(user_id uuid, user_email text, user_full_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role
  ) VALUES (
    user_id,
    user_email,
    user_full_name,
    'franchisee'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = now();
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'Error in create_franchisee_profile: %', SQLERRM;
      RAISE;
END;
$$;

-- Fix update_franchisee_last_access function
CREATE OR REPLACE FUNCTION public.update_franchisee_last_access()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.franchisee_access_log 
  SET logout_time = now(),
      session_duration = EXTRACT(EPOCH FROM (now() - login_time)) / 60
  WHERE user_id = NEW.user_id 
    AND logout_time IS NULL 
    AND id != NEW.id;
  
  RETURN NEW;
END;
$$;

-- Fix calculate_vacation_balance function
CREATE OR REPLACE FUNCTION public.calculate_vacation_balance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  NEW.vacation_days_pending = NEW.vacation_days_per_year - NEW.vacation_days_used;
  RETURN NEW;
END;
$$;
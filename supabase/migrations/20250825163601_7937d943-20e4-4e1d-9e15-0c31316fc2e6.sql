-- FASE 4: Corrección final de funciones y limpieza

-- Corregir las funciones que aún pueden estar faltando search_path
CREATE OR REPLACE FUNCTION public.user_must_change_password(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT must_change_password FROM public.user_temp_passwords WHERE user_id = user_uuid),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.mark_password_changed(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_temp_passwords 
  SET must_change_password = false, 
      changed_at = now()
  WHERE user_id = user_uuid;
  
  -- Si no existe registro, crear uno marcado como cambiado
  INSERT INTO public.user_temp_passwords (user_id, must_change_password, changed_at)
  VALUES (user_uuid, false, now())
  ON CONFLICT (user_id) DO UPDATE SET
    must_change_password = false,
    changed_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_secure_temp_password()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  special_chars TEXT := '!@#$%&*';
  password TEXT := '';
  i INTEGER;
BEGIN
  -- Generar 8 caracteres aleatorios
  FOR i IN 1..8 LOOP
    password := password || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  -- Añadir caracteres especiales para cumplir requisitos
  password := password || substr(special_chars, floor(random() * length(special_chars) + 1)::integer, 1);
  password := password || chr(65 + floor(random() * 26)::integer); -- Mayúscula
  password := password || chr(48 + floor(random() * 10)::integer); -- Número
  
  RETURN password;
END;
$$;

-- Investigar la vista franchisee_staff_compat para entender si es la que causa problemas
-- En lugar de eliminarla, vamos a asegurarnos de que no tenga SECURITY DEFINER

-- Verificar si hay más funciones que necesitan search_path
CREATE OR REPLACE FUNCTION public.cleanup_old_temp_passwords()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.user_temp_passwords 
  WHERE changed_at IS NOT NULL 
    AND changed_at < now() - INTERVAL '30 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_password_strength(password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
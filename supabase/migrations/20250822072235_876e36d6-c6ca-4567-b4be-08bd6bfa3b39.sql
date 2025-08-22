-- Actualizar la función admin-users para soportar mustChangePassword
-- También crear función de envío de emails de bienvenida

-- 1. Crear tabla para tracking de usuarios con contraseña temporal
CREATE TABLE IF NOT EXISTS public.user_temp_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_temp_passwords ENABLE ROW LEVEL SECURITY;

-- Política para superadmins solamente
CREATE POLICY "Only superadmins can manage temp passwords"
ON public.user_temp_passwords
FOR ALL
USING (get_current_user_role() = 'superadmin')
WITH CHECK (get_current_user_role() = 'superadmin');

-- 2. Función para verificar si un usuario debe cambiar contraseña
CREATE OR REPLACE FUNCTION public.user_must_change_password(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT must_change_password FROM public.user_temp_passwords WHERE user_id = user_uuid),
    false
  );
$$;

-- 3. Función para marcar contraseña como cambiada
CREATE OR REPLACE FUNCTION public.mark_password_changed(user_uuid UUID)
RETURNS VOID
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

-- 4. Trigger automático para limpiar registros antiguos
CREATE OR REPLACE FUNCTION public.cleanup_old_temp_passwords()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_temp_passwords 
  WHERE changed_at IS NOT NULL 
    AND changed_at < now() - INTERVAL '30 days';
END;
$$;

-- 5. Función mejorada para generar contraseñas seguras
CREATE OR REPLACE FUNCTION public.generate_secure_temp_password()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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
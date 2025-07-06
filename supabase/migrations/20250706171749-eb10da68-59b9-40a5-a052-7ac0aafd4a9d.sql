-- 1. Crear función para detectar impersonación de asesores
CREATE OR REPLACE FUNCTION public.get_effective_franchisee_for_advisor()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Por ahora retorna NULL, se implementará la lógica de impersonación en el frontend
  SELECT NULL::uuid;
$$;

-- 2. Actualizar políticas RLS para permitir a asesores acceder a todos los datos
DROP POLICY IF EXISTS "franchisee_restaurants_all_for_advisors" ON public.franchisee_restaurants;
DROP POLICY IF EXISTS "franchisees_all_for_advisors" ON public.franchisees;
DROP POLICY IF EXISTS "base_restaurants_all_for_advisors" ON public.base_restaurants;

-- Política unificada para franquiciados - permite a asesores ver todos los datos
CREATE POLICY "Unified franchisees access policy" 
ON public.franchisees 
FOR ALL 
USING (
  CASE
    WHEN get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text]) THEN true
    WHEN get_current_user_role() = 'franchisee'::text THEN (user_id = auth.uid())
    WHEN get_current_user_role() = 'staff'::text THEN user_is_staff_of_franchisee(id)
    ELSE false
  END
)
WITH CHECK (
  CASE
    WHEN get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text]) THEN true
    WHEN get_current_user_role() = 'franchisee'::text THEN (user_id = auth.uid())
    WHEN get_current_user_role() = 'staff'::text THEN user_is_staff_of_franchisee(id)
    ELSE false
  END
);

-- Política unificada para restaurantes de franquiciados
CREATE POLICY "Unified franchisee restaurants access policy" 
ON public.franchisee_restaurants 
FOR ALL 
USING (
  CASE
    WHEN get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text]) THEN true
    WHEN get_current_user_role() = 'franchisee'::text THEN (
      EXISTS (
        SELECT 1 FROM franchisees 
        WHERE franchisees.id = franchisee_restaurants.franchisee_id 
        AND franchisees.user_id = auth.uid()
      )
    )
    WHEN get_current_user_role() = 'staff'::text THEN user_is_staff_of_franchisee(franchisee_id)
    ELSE false
  END
)
WITH CHECK (
  CASE
    WHEN get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text]) THEN true
    WHEN get_current_user_role() = 'franchisee'::text THEN (
      EXISTS (
        SELECT 1 FROM franchisees 
        WHERE franchisees.id = franchisee_restaurants.franchisee_id 
        AND franchisees.user_id = auth.uid()
      )
    )
    WHEN get_current_user_role() = 'staff'::text THEN user_is_staff_of_franchisee(franchisee_id)
    ELSE false
  END
);

-- Política unificada para restaurantes base
CREATE POLICY "Unified base restaurants access policy" 
ON public.base_restaurants 
FOR ALL 
USING (
  CASE
    WHEN get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text]) THEN true
    ELSE true -- Los franquiciados pueden ver todos los restaurantes base para referencia
  END
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text])
);

-- Política mejorada para perfiles que permite a asesores gestionar todos los usuarios
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;
CREATE POLICY "Unified profiles access policy" 
ON public.profiles 
FOR ALL 
USING (
  CASE
    WHEN auth.uid() IS NULL THEN false
    WHEN get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text]) THEN true
    ELSE (auth.uid() = id)
  END
)
WITH CHECK (
  CASE
    WHEN auth.uid() IS NULL THEN true -- Permite creación durante registro
    WHEN get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text]) THEN true
    ELSE (auth.uid() = id)
  END
);
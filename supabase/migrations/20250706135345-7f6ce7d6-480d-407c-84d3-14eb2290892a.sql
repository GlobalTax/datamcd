-- Reestructuración completa del sistema de roles
-- Paso 1: Actualizar roles existentes
UPDATE public.profiles 
SET role = 'admin' 
WHERE role = 'asesor';

-- Paso 2: Crear tabla franchisee_staff para gestionar personal
CREATE TABLE public.franchisee_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  franchisee_id UUID NOT NULL REFERENCES public.franchisees(id) ON DELETE CASCADE,
  position TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, franchisee_id)
);

-- Habilitar RLS en franchisee_staff
ALTER TABLE public.franchisee_staff ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para franchisee_staff
CREATE POLICY "Staff can view their own assignments" ON public.franchisee_staff
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Franchisees can manage their staff" ON public.franchisee_staff
FOR ALL USING (
  franchisee_id IN (
    SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all staff" ON public.franchisee_staff
FOR ALL USING (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin'])
);

-- Paso 3: Actualizar función get_current_user_role para incluir nuevos roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'franchisee' -- valor por defecto
  );
$$;

-- Paso 4: Función para verificar si un usuario es staff de un franquiciado
CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(franchisee_uuid uuid)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.franchisee_staff 
    WHERE user_id = auth.uid() AND franchisee_id = franchisee_uuid
  );
$$;

-- Paso 5: Actualizar políticas RLS existentes para incluir staff
-- Actualizar política de franchisees para incluir staff
DROP POLICY IF EXISTS "Franchisees access policy" ON public.franchisees;
CREATE POLICY "Franchisees access policy" ON public.franchisees
FOR ALL USING (
  CASE
    WHEN get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) THEN true
    WHEN get_current_user_role() = 'franchisee' THEN user_id = auth.uid()
    WHEN get_current_user_role() = 'staff' THEN user_is_staff_of_franchisee(id)
    ELSE false
  END
)
WITH CHECK (
  CASE
    WHEN get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) THEN true
    WHEN get_current_user_role() = 'franchisee' THEN user_id = auth.uid()
    WHEN get_current_user_role() = 'staff' THEN user_is_staff_of_franchisee(id)
    ELSE false
  END
);

-- Actualizar política de franchisee_restaurants para incluir staff
DROP POLICY IF EXISTS "Franchisee restaurants access policy" ON public.franchisee_restaurants;
CREATE POLICY "Franchisee restaurants access policy" ON public.franchisee_restaurants
FOR ALL USING (
  CASE
    WHEN get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) THEN true
    WHEN get_current_user_role() = 'franchisee' AND EXISTS (
      SELECT 1 FROM public.franchisees 
      WHERE id = franchisee_restaurants.franchisee_id AND user_id = auth.uid()
    ) THEN true
    WHEN get_current_user_role() = 'staff' AND user_is_staff_of_franchisee(franchisee_id) THEN true
    ELSE false
  END
)
WITH CHECK (
  CASE
    WHEN get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) THEN true
    WHEN get_current_user_role() = 'franchisee' AND EXISTS (
      SELECT 1 FROM public.franchisees 
      WHERE id = franchisee_restaurants.franchisee_id AND user_id = auth.uid()
    ) THEN true
    WHEN get_current_user_role() = 'staff' AND user_is_staff_of_franchisee(franchisee_id) THEN true
    ELSE false
  END
);

-- Actualizar política de employees para incluir staff
DROP POLICY IF EXISTS "Franchisees can manage their restaurant employees" ON public.employees;
CREATE POLICY "Franchisees can manage their restaurant employees" ON public.employees
FOR ALL USING (
  restaurant_id IN (
    SELECT fr.id
    FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() 
    OR user_is_staff_of_franchisee(f.id)
  )
);

-- Trigger para updated_at en franchisee_staff
CREATE TRIGGER update_franchisee_staff_updated_at
  BEFORE UPDATE ON public.franchisee_staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
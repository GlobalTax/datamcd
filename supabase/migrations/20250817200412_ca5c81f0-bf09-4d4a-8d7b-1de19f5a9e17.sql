-- ========================================
-- SISTEMA RBAC POR RESTAURANTE
-- ========================================

-- 1. Crear tabla restaurant_members
CREATE TABLE public.restaurant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES public.franchisee_restaurants(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('owner', 'manager', 'staff', 'viewer')) NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  assigned_by uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT true NOT NULL,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, restaurant_id, role)
);

-- 2. Crear tabla advisor_restaurant
CREATE TABLE public.advisor_restaurant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES public.franchisee_restaurants(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  assigned_by uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT true NOT NULL,
  access_level text CHECK (access_level IN ('read', 'write', 'full')) DEFAULT 'read',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(advisor_user_id, restaurant_id)
);

-- 3. Crear índices para rendimiento
CREATE INDEX idx_restaurant_members_user_restaurant ON public.restaurant_members(user_id, restaurant_id) WHERE is_active = true;
CREATE INDEX idx_restaurant_members_restaurant ON public.restaurant_members(restaurant_id) WHERE is_active = true;
CREATE INDEX idx_advisor_restaurant_advisor ON public.advisor_restaurant(advisor_user_id) WHERE is_active = true;
CREATE INDEX idx_advisor_restaurant_restaurant ON public.advisor_restaurant(restaurant_id) WHERE is_active = true;

-- 4. Habilitar RLS
ALTER TABLE public.restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_restaurant ENABLE ROW LEVEL SECURITY;

-- 5. Funciones de seguridad
CREATE OR REPLACE FUNCTION public.user_has_restaurant_access(
  _user_id uuid, 
  _restaurant_id uuid, 
  _required_role text DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_members rm
    WHERE rm.user_id = _user_id 
      AND rm.restaurant_id = _restaurant_id 
      AND rm.is_active = true
      AND (_required_role IS NULL OR rm.role = _required_role 
           OR (rm.role = 'owner' AND _required_role IN ('manager', 'staff', 'viewer'))
           OR (rm.role = 'manager' AND _required_role IN ('staff', 'viewer')))
  );
$$;

CREATE OR REPLACE FUNCTION public.advisor_has_restaurant_access(
  _advisor_id uuid, 
  _restaurant_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.advisor_restaurant ar
    WHERE ar.advisor_user_id = _advisor_id 
      AND ar.restaurant_id = _restaurant_id 
      AND ar.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_restaurant_role(
  _user_id uuid, 
  _restaurant_id uuid
)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rm.role 
  FROM public.restaurant_members rm
  WHERE rm.user_id = _user_id 
    AND rm.restaurant_id = _restaurant_id 
    AND rm.is_active = true
  ORDER BY 
    CASE rm.role 
      WHEN 'owner' THEN 1
      WHEN 'manager' THEN 2  
      WHEN 'staff' THEN 3
      WHEN 'viewer' THEN 4
    END
  LIMIT 1;
$$;

-- 6. Políticas RLS para restaurant_members
CREATE POLICY "Admins can manage all restaurant members" ON public.restaurant_members
FOR ALL USING (get_current_user_role() = ANY (ARRAY['admin', 'superadmin']));

CREATE POLICY "Restaurant owners can manage members" ON public.restaurant_members
FOR ALL USING (
  restaurant_id IN (
    SELECT rm.restaurant_id FROM public.restaurant_members rm
    WHERE rm.user_id = auth.uid() AND rm.role = 'owner' AND rm.is_active = true
  )
);

CREATE POLICY "Users can view their own memberships" ON public.restaurant_members
FOR SELECT USING (user_id = auth.uid());

-- 7. Políticas RLS para advisor_restaurant
CREATE POLICY "Admins can manage advisor assignments" ON public.advisor_restaurant
FOR ALL USING (get_current_user_role() = ANY (ARRAY['admin', 'superadmin']));

CREATE POLICY "Advisors can view their assignments" ON public.advisor_restaurant
FOR SELECT USING (advisor_user_id = auth.uid());

CREATE POLICY "Restaurant owners can view advisor assignments" ON public.advisor_restaurant
FOR SELECT USING (
  restaurant_id IN (
    SELECT rm.restaurant_id FROM public.restaurant_members rm
    WHERE rm.user_id = auth.uid() AND rm.role = 'owner' AND rm.is_active = true
  )
);

-- 8. Triggers para updated_at
CREATE TRIGGER update_restaurant_members_updated_at
  BEFORE UPDATE ON public.restaurant_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_restaurant_updated_at
  BEFORE UPDATE ON public.advisor_restaurant
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Seeding inicial: crear owners automáticamente
INSERT INTO public.restaurant_members (user_id, restaurant_id, role, assigned_at)
SELECT 
  f.user_id,
  fr.id as restaurant_id,
  'owner' as role,
  fr.assigned_at
FROM public.franchisees f
JOIN public.franchisee_restaurants fr ON fr.franchisee_id = f.id
WHERE f.user_id IS NOT NULL 
  AND fr.status = 'active'
ON CONFLICT (user_id, restaurant_id, role) DO NOTHING;

-- 10. Actualizar políticas RLS existentes
-- Actualizar employees
DROP POLICY IF EXISTS "Employees access policy" ON public.employees;

CREATE POLICY "Restaurant based employee access" ON public.employees
FOR ALL USING (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  user_has_restaurant_access(auth.uid(), restaurant_id, 'viewer') OR
  advisor_has_restaurant_access(auth.uid(), restaurant_id)
);

-- Actualizar incidents
DROP POLICY IF EXISTS "Incidents access policy" ON public.incidents;

CREATE POLICY "Restaurant based incident access" ON public.incidents
FOR ALL USING (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  user_has_restaurant_access(auth.uid(), restaurant_id, 'viewer') OR
  advisor_has_restaurant_access(auth.uid(), restaurant_id) OR
  auth.uid() IS NOT NULL
);

-- Actualizar monthly_tracking
DROP POLICY IF EXISTS "Franchisees can view their monthly tracking" ON public.monthly_tracking;
DROP POLICY IF EXISTS "Franchisees can insert their monthly tracking" ON public.monthly_tracking;
DROP POLICY IF EXISTS "Franchisees can update their monthly tracking" ON public.monthly_tracking;
DROP POLICY IF EXISTS "Franchisees can delete their monthly tracking" ON public.monthly_tracking;

CREATE POLICY "Restaurant based monthly tracking access" ON public.monthly_tracking
FOR SELECT USING (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  user_has_restaurant_access(auth.uid(), franchisee_restaurant_id, 'viewer') OR
  advisor_has_restaurant_access(auth.uid(), franchisee_restaurant_id)
);

CREATE POLICY "Restaurant based monthly tracking insert" ON public.monthly_tracking
FOR INSERT WITH CHECK (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  user_has_restaurant_access(auth.uid(), franchisee_restaurant_id, 'staff')
);

CREATE POLICY "Restaurant based monthly tracking update" ON public.monthly_tracking
FOR UPDATE USING (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  user_has_restaurant_access(auth.uid(), franchisee_restaurant_id, 'staff')
);

CREATE POLICY "Restaurant based monthly tracking delete" ON public.monthly_tracking
FOR DELETE USING (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  user_has_restaurant_access(auth.uid(), franchisee_restaurant_id, 'manager')
);

-- 11. Vista de compatibilidad temporal
CREATE VIEW public.franchisee_staff_compat AS
SELECT DISTINCT ON (rm.user_id, f.id)
  gen_random_uuid() as id,
  rm.user_id,
  f.id as franchisee_id,
  rm.role as position,
  rm.permissions,
  rm.created_at,
  rm.updated_at
FROM public.restaurant_members rm
JOIN public.franchisee_restaurants fr ON fr.id = rm.restaurant_id
JOIN public.franchisees f ON f.id = fr.franchisee_id
WHERE rm.is_active = true;
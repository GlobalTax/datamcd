-- Resolver problemas de seguridad detectados por el linter

-- 1. Recrear la vista de compatibilidad sin SECURITY DEFINER
DROP VIEW IF EXISTS public.franchisee_staff_compat;

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

-- 2. Habilitar RLS en la vista para mantener seguridad
ALTER VIEW public.franchisee_staff_compat SET (security_barrier = true);

-- 3. Agregar política RLS para la vista de compatibilidad
CREATE POLICY "Franchisee staff compat access" ON public.franchisee_staff_compat
FOR SELECT USING (
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  user_id = auth.uid() OR
  franchisee_id IN (
    SELECT f.id FROM public.franchisees f WHERE f.user_id = auth.uid()
  )
);
-- Resolver problemas de seguridad - usar función con nombres correctos

-- Crear función de compatibilidad más segura
CREATE OR REPLACE FUNCTION public.get_franchisee_staff_compat()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  franchisee_id uuid,
  "position" text,
  permissions jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (rm.user_id, f.id)
    gen_random_uuid() as id,
    rm.user_id,
    f.id as franchisee_id,
    rm.role as "position",
    rm.permissions,
    rm.created_at,
    rm.updated_at
  FROM public.restaurant_members rm
  JOIN public.franchisee_restaurants fr ON fr.id = rm.restaurant_id
  JOIN public.franchisees f ON f.id = fr.franchisee_id
  WHERE rm.is_active = true
    AND (
      get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
      rm.user_id = auth.uid() OR
      f.user_id = auth.uid()
    );
$$;
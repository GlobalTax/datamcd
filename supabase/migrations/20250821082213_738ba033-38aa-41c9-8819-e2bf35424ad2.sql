-- Fix critical RLS policy for restaurant_valuations
-- Currently: any authenticated user can view all valuations
-- Should be: only restaurant owners, advisors, and admins can view relevant valuations

DROP POLICY IF EXISTS "Users can view all restaurant valuations" ON public.restaurant_valuations;

-- Create proper access control for restaurant valuations
CREATE POLICY "Restaurant valuations access control" 
ON public.restaurant_valuations 
FOR ALL 
USING (
  -- Admins and superadmins can access all
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  -- Restaurant owners can view their own restaurant valuations
  restaurant_id IN (
    SELECT rm.restaurant_id 
    FROM public.restaurant_members rm
    WHERE rm.user_id = auth.uid() 
      AND rm.is_active = true 
      AND rm.role IN ('owner', 'manager')
  ) OR
  -- Advisors can view valuations for restaurants they advise
  restaurant_id IN (
    SELECT ar.restaurant_id
    FROM public.advisor_restaurant ar
    WHERE ar.advisor_user_id = auth.uid()
      AND ar.is_active = true
  ) OR
  -- Franchisees can view valuations for their restaurants
  restaurant_id IN (
    SELECT fr.id
    FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Same logic for inserts/updates
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  restaurant_id IN (
    SELECT rm.restaurant_id 
    FROM public.restaurant_members rm
    WHERE rm.user_id = auth.uid() 
      AND rm.is_active = true 
      AND rm.role IN ('owner', 'manager')
  ) OR
  restaurant_id IN (
    SELECT ar.restaurant_id
    FROM public.advisor_restaurant ar
    WHERE ar.advisor_user_id = auth.uid()
      AND ar.is_active = true
  ) OR
  restaurant_id IN (
    SELECT fr.id
    FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  )
);

-- Fix quantum account mapping access
-- Currently: anyone can view account mapping  
-- Should be: only users who manage accounting integrations

DROP POLICY IF EXISTS "Anyone can view account mapping" ON public.quantum_account_mapping;

-- Create proper access control for quantum account mapping
CREATE POLICY "Quantum account mapping access control"
ON public.quantum_account_mapping
FOR ALL
USING (
  -- Admins and superadmins can access all
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  -- Franchisees can view mappings for their own restaurants
  restaurant_id IN (
    SELECT fr.id
    FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR
  -- Advisors can view mappings for restaurants they advise
  restaurant_id IN (
    SELECT ar.restaurant_id
    FROM public.advisor_restaurant ar
    WHERE ar.advisor_user_id = auth.uid()
      AND ar.is_active = true
  )
)
WITH CHECK (
  -- Same logic for inserts/updates
  get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
  restaurant_id IN (
    SELECT fr.id
    FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR
  restaurant_id IN (
    SELECT ar.restaurant_id
    FROM public.advisor_restaurant ar
    WHERE ar.advisor_user_id = auth.uid()
      AND ar.is_active = true
  )
);

-- Log security policy updates
INSERT INTO public.audit_logs (
  user_id,
  action_type,
  table_name,
  record_id,
  new_values
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- System user
  'SECURITY_UPDATE',
  'rls_policies',
  'restaurant_valuations_quantum_mapping',
  jsonb_build_object(
    'action', 'fixed_overly_permissive_rls_policies',
    'tables_affected', ARRAY['restaurant_valuations', 'quantum_account_mapping'],
    'timestamp', now(),
    'security_level', 'critical'
  )
);
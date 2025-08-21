-- Fix critical RLS policies with proper type casting
-- Note: Using TEXT comparison for restaurant_id fields that store site numbers

-- First, check if restaurant_valuations table exists and get its structure
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_valuations') THEN
    -- Drop existing overly permissive policy
    DROP POLICY IF EXISTS "Users can view all restaurant valuations" ON public.restaurant_valuations;
    
    -- Create proper access control for restaurant valuations
    CREATE POLICY "Restaurant valuations access control" 
    ON public.restaurant_valuations 
    FOR ALL 
    USING (
      -- Admins and superadmins can access all
      get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
      -- Restaurant owners can view valuations for restaurants they own
      EXISTS (
        SELECT 1 FROM public.franchisee_restaurants fr
        JOIN public.franchisees f ON f.id = fr.franchisee_id
        JOIN public.base_restaurants br ON br.id = fr.base_restaurant_id
        WHERE f.user_id = auth.uid()
          AND br.site_number = restaurant_valuations.restaurant_id::text
      ) OR
      -- Advisors can view valuations for restaurants they advise
      EXISTS (
        SELECT 1 FROM public.advisor_restaurant ar
        JOIN public.franchisee_restaurants fr ON fr.id = ar.restaurant_id
        JOIN public.base_restaurants br ON br.id = fr.base_restaurant_id
        WHERE ar.advisor_user_id = auth.uid()
          AND ar.is_active = true
          AND br.site_number = restaurant_valuations.restaurant_id::text
      )
    )
    WITH CHECK (
      -- Same logic for inserts/updates
      get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
      EXISTS (
        SELECT 1 FROM public.franchisee_restaurants fr
        JOIN public.franchisees f ON f.id = fr.franchisee_id
        JOIN public.base_restaurants br ON br.id = fr.base_restaurant_id
        WHERE f.user_id = auth.uid()
          AND br.site_number = restaurant_valuations.restaurant_id::text
      ) OR
      EXISTS (
        SELECT 1 FROM public.advisor_restaurant ar
        JOIN public.franchisee_restaurants fr ON fr.id = ar.restaurant_id
        JOIN public.base_restaurants br ON br.id = fr.base_restaurant_id
        WHERE ar.advisor_user_id = auth.uid()
          AND ar.is_active = true
          AND br.site_number = restaurant_valuations.restaurant_id::text
      )
    );
  END IF;
END $$;

-- Fix quantum account mapping access if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quantum_account_mapping') THEN
    -- Drop existing overly permissive policy
    DROP POLICY IF EXISTS "Anyone can view account mapping" ON public.quantum_account_mapping;
    
    -- Create proper access control for quantum account mapping
    CREATE POLICY "Quantum account mapping access control"
    ON public.quantum_account_mapping
    FOR ALL
    USING (
      -- Admins and superadmins can access all
      get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
      -- Franchisees can view mappings for their own restaurants
      EXISTS (
        SELECT 1 FROM public.franchisee_restaurants fr
        JOIN public.franchisees f ON f.id = fr.franchisee_id
        WHERE f.user_id = auth.uid()
          AND fr.id = quantum_account_mapping.restaurant_id
      ) OR
      -- Advisors can view mappings for restaurants they advise
      EXISTS (
        SELECT 1 FROM public.advisor_restaurant ar
        WHERE ar.advisor_user_id = auth.uid()
          AND ar.is_active = true
          AND ar.restaurant_id = quantum_account_mapping.restaurant_id
      )
    )
    WITH CHECK (
      -- Same logic for inserts/updates
      get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
      EXISTS (
        SELECT 1 FROM public.franchisee_restaurants fr
        JOIN public.franchisees f ON f.id = fr.franchisee_id
        WHERE f.user_id = auth.uid()
          AND fr.id = quantum_account_mapping.restaurant_id
      ) OR
      EXISTS (
        SELECT 1 FROM public.advisor_restaurant ar
        WHERE ar.advisor_user_id = auth.uid()
          AND ar.is_active = true
          AND ar.restaurant_id = quantum_account_mapping.restaurant_id
      )
    );
  END IF;
END $$;

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
  'critical_data_protection_fix',
  jsonb_build_object(
    'action', 'fixed_overly_permissive_rls_policies',
    'tables_affected', ARRAY['restaurant_valuations', 'quantum_account_mapping'],
    'timestamp', now(),
    'security_level', 'critical',
    'description', 'Restricted access to sensitive financial and accounting data'
  )
);
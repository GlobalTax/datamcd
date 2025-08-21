-- Fix restaurant valuations RLS policy only
-- The quantum_account_mapping table structure needs to be checked separately

DO $$
BEGIN
  -- Only fix restaurant_valuations if it exists and has the expected structure
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_valuations') THEN
    -- Drop existing overly permissive policy
    DROP POLICY IF EXISTS "Users can view all restaurant valuations" ON public.restaurant_valuations;
    
    -- Create proper access control for restaurant valuations
    CREATE POLICY "Restaurant valuations restricted access" 
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
      )
    );
    
    -- Log the security fix
    INSERT INTO public.audit_logs (
      user_id,
      action_type,
      table_name,
      record_id,
      new_values
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'SECURITY_FIX',
      'restaurant_valuations',
      'rls_policy_fix',
      jsonb_build_object(
        'action', 'restricted_restaurant_valuations_access',
        'timestamp', now(),
        'security_level', 'critical',
        'description', 'Fixed overly permissive RLS policy on restaurant valuations'
      )
    );
  END IF;
END $$;

-- Create a function to audit sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  table_name text,
  record_id text,
  access_type text DEFAULT 'READ'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'SENSITIVE_DATA_ACCESS',
    table_name,
    record_id,
    jsonb_build_object(
      'access_type', access_type,
      'timestamp', now(),
      'user_role', get_current_user_role(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    )
  );
END;
$$;
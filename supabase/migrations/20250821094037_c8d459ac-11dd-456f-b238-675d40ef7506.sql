-- CRITICAL SECURITY FIXES - Phase 1
-- Fix quantum_account_mapping public access and restaurant_members infinite recursion

-- 1. Fix quantum_account_mapping - remove public access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quantum_account_mapping') THEN
    -- Drop the overly permissive policy
    DROP POLICY IF EXISTS "Anyone can view account mapping" ON public.quantum_account_mapping;
    
    -- Create restricted access policy
    CREATE POLICY "Quantum account mapping restricted access" 
    ON public.quantum_account_mapping 
    FOR ALL 
    USING (
      -- Only admins, superadmins, and franchisee owners can access
      get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
      -- Franchisees can only see their own mapping data
      EXISTS (
        SELECT 1 FROM public.franchisees f
        WHERE f.user_id = auth.uid()
          AND f.id = quantum_account_mapping.franchisee_id
      )
    )
    WITH CHECK (
      get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
      EXISTS (
        SELECT 1 FROM public.franchisees f
        WHERE f.user_id = auth.uid()
          AND f.id = quantum_account_mapping.franchisee_id
      )
    );
    
    -- Log the security fix
    PERFORM public.log_sensitive_data_access(
      'quantum_account_mapping',
      'security_policy_fix',
      'SECURITY_FIX'
    );
  END IF;
END $$;

-- 2. Create security definer function to avoid infinite recursion in restaurant_members
CREATE OR REPLACE FUNCTION public.get_user_restaurant_owner_status(
  user_uuid uuid, 
  restaurant_uuid uuid
) RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.franchisee_restaurants fr
    JOIN public.franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = user_uuid 
      AND fr.id = restaurant_uuid
  );
$$;

-- 3. Fix restaurant_members infinite recursion
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_members') THEN
    -- Drop problematic policies that cause recursion
    DROP POLICY IF EXISTS "Restaurant members can view restaurant members" ON public.restaurant_members;
    DROP POLICY IF EXISTS "Users can view restaurant members for owned restaurants" ON public.restaurant_members;
    
    -- Create non-recursive policy using security definer function
    CREATE POLICY "Restaurant members restricted access" 
    ON public.restaurant_members 
    FOR ALL 
    USING (
      -- Admins and superadmins can access all
      get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
      -- Users can see their own membership records
      user_id = auth.uid() OR
      -- Restaurant owners can see all members of their restaurants
      public.get_user_restaurant_owner_status(auth.uid(), restaurant_id) OR
      -- Advisors can see members of restaurants they advise
      advisor_has_restaurant_access(auth.uid(), restaurant_id)
    )
    WITH CHECK (
      get_current_user_role() = ANY (ARRAY['admin', 'superadmin']) OR
      public.get_user_restaurant_owner_status(auth.uid(), restaurant_id)
    );
  END IF;
END $$;

-- 4. Enhanced audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_table_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive tables
  IF TG_TABLE_NAME IN ('quantum_account_mapping', 'restaurant_members', 'restaurant_valuations') THEN
    PERFORM public.log_sensitive_data_access(
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      TG_OP
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 5. Apply audit triggers to sensitive tables
DO $$
BEGIN
  -- Add triggers for sensitive data access logging
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quantum_account_mapping') THEN
    DROP TRIGGER IF EXISTS audit_quantum_access ON public.quantum_account_mapping;
    CREATE TRIGGER audit_quantum_access
      AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.quantum_account_mapping
      FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_table_access();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_members') THEN
    DROP TRIGGER IF EXISTS audit_restaurant_members_access ON public.restaurant_members;
    CREATE TRIGGER audit_restaurant_members_access
      AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.restaurant_members
      FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_table_access();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_valuations') THEN
    DROP TRIGGER IF EXISTS audit_restaurant_valuations_access ON public.restaurant_valuations;
    CREATE TRIGGER audit_restaurant_valuations_access
      AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.restaurant_valuations
      FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_table_access();
  END IF;
END $$;

-- 6. Create function to clean up old audit logs (for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(days_to_keep integer DEFAULT 90)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.audit_logs 
  WHERE created_at < now() - (days_to_keep || ' days')::interval
    AND action_type NOT IN ('SECURITY_FIX', 'CRITICAL_SECURITY_EVENT');
  
  -- Log the cleanup
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    table_name,
    record_id,
    new_values
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'MAINTENANCE',
    'audit_logs',
    'cleanup_old_records',
    jsonb_build_object(
      'action', 'cleanup_old_audit_logs',
      'days_kept', days_to_keep,
      'timestamp', now()
    )
  );
END;
$$;

-- 7. Log completion of security fixes
INSERT INTO public.audit_logs (
  user_id,
  action_type,
  table_name,
  record_id,
  new_values
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'SECURITY_FIX',
  'system_security',
  'comprehensive_security_review_fixes',
  jsonb_build_object(
    'action', 'implemented_critical_security_fixes',
    'timestamp', now(),
    'fixes_applied', jsonb_build_array(
      'quantum_account_mapping_access_restricted',
      'restaurant_members_infinite_recursion_fixed',
      'enhanced_audit_logging_implemented',
      'sensitive_data_access_triggers_added'
    ),
    'security_level', 'critical',
    'description', 'Comprehensive security review fixes implemented - Phase 1'
  )
);
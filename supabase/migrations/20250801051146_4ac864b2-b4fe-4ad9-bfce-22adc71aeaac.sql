-- PHASE 1: CRITICAL SECURITY FIXES (Fixed)
-- Fix 1: Add missing RLS policies for critical tables

-- Enable RLS on profit_loss_data table if not already enabled
ALTER TABLE public.profit_loss_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for profit_loss_data
DROP POLICY IF EXISTS "Franchisees can manage their profit loss data" ON public.profit_loss_data;
CREATE POLICY "Franchisees can manage their profit loss data" 
ON public.profit_loss_data 
FOR ALL 
USING (
  restaurant_id IN (
    SELECT fr.base_restaurant_id
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  restaurant_id IN (
    SELECT fr.base_restaurant_id
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Enable RLS on profit_loss_templates table if not already enabled
ALTER TABLE public.profit_loss_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for profit_loss_templates
DROP POLICY IF EXISTS "Users can manage profit loss templates" ON public.profit_loss_templates;
CREATE POLICY "Users can manage profit loss templates" 
ON public.profit_loss_templates 
FOR ALL 
USING (
  created_by = auth.uid() OR 
  is_public = true OR 
  get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  created_by = auth.uid() OR 
  get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Enable RLS on restaurant table if not already enabled
ALTER TABLE public.restaurant ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for restaurant table
DROP POLICY IF EXISTS "Users can access restaurants they manage" ON public.restaurant;
CREATE POLICY "Users can access restaurants they manage" 
ON public.restaurant 
FOR ALL 
USING (
  id IN (
    SELECT fr.base_restaurant_id
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  id IN (
    SELECT fr.base_restaurant_id
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Fix 2: Update overly permissive RLS policies

-- Drop and recreate restaurant_valuations policy
DROP POLICY IF EXISTS "Anyone can access restaurant valuations" ON public.restaurant_valuations;
CREATE POLICY "Franchisees can manage their restaurant valuations" 
ON public.restaurant_valuations 
FOR ALL 
USING (
  restaurant_id IN (
    SELECT fr.base_restaurant_id
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  restaurant_id IN (
    SELECT fr.base_restaurant_id
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Drop and recreate valuation_scenarios policy
DROP POLICY IF EXISTS "Anyone can access valuation scenarios" ON public.valuation_scenarios;
CREATE POLICY "Franchisees can manage their valuation scenarios" 
ON public.valuation_scenarios 
FOR ALL 
USING (
  valuation_id IN (
    SELECT rv.id
    FROM restaurant_valuations rv
    WHERE rv.restaurant_id IN (
      SELECT fr.base_restaurant_id
      FROM franchisee_restaurants fr
      JOIN franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid()
    )
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  valuation_id IN (
    SELECT rv.id
    FROM restaurant_valuations rv
    WHERE rv.restaurant_id IN (
      SELECT fr.base_restaurant_id
      FROM franchisee_restaurants fr
      JOIN franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid()
    )
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Update quantum_account_mapping to require authentication
DROP POLICY IF EXISTS "Anyone can access quantum mappings" ON public.quantum_account_mapping;
CREATE POLICY "Authenticated users can manage quantum mappings" 
ON public.quantum_account_mapping 
FOR ALL 
USING (
  auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Fix 3: Improve security definer functions with proper search path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create helper function to check if user is staff of franchisee
CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(target_franchisee_id uuid)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.franchisee_staff 
    WHERE user_id = auth.uid() AND franchisee_id = target_franchisee_id
  );
$$;

-- Fix 4: Enhance user deletion validation with proper type handling
CREATE OR REPLACE FUNCTION public.validate_user_deletion(target_user_id uuid, deleter_user_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  deleter_role TEXT;
  target_role TEXT;
BEGIN
  -- Get roles with explicit casting
  SELECT role INTO deleter_role FROM public.profiles WHERE id = deleter_user_id;
  SELECT role INTO target_role FROM public.profiles WHERE id = target_user_id;
  
  -- Validate inputs
  IF deleter_role IS NULL OR target_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Prevent self-deletion
  IF deleter_user_id = target_user_id THEN
    RETURN false;
  END IF;
  
  -- Role hierarchy validation
  CASE deleter_role
    WHEN 'superadmin' THEN
      -- Superadmin can delete anyone except other superadmins
      RETURN target_role != 'superadmin';
    WHEN 'admin' THEN
      -- Admin can delete franchisee and staff but not admin or superadmin
      RETURN target_role IN ('franchisee', 'staff');
    ELSE
      -- Other roles cannot delete users
      RETURN false;
  END CASE;
END;
$$;
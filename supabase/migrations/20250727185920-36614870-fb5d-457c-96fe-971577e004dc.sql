-- First, let's check and create the get_current_user_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update the RLS policy for integration_configs to work properly
DROP POLICY IF EXISTS "Franchisee integration configs access" ON public.integration_configs;

CREATE POLICY "Franchisee integration configs access" 
ON public.integration_configs 
FOR ALL 
USING (
  -- Allow superadmins and admins to access all configs
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  ) 
  OR 
  -- Allow franchisees to access their own configs
  (
    franchisee_id IN (
      SELECT franchisees.id
      FROM franchisees
      WHERE franchisees.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  -- Allow superadmins and admins to create/update all configs
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  ) 
  OR 
  -- Allow franchisees to create/update their own configs
  (
    franchisee_id IN (
      SELECT franchisees.id
      FROM franchisees
      WHERE franchisees.user_id = auth.uid()
    )
  )
);
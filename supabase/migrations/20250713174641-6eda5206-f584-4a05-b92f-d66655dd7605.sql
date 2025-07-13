-- Fix RLS policies for integration_configs table
DROP POLICY IF EXISTS "Advisors can manage integrations" ON public.integration_configs;

-- Create comprehensive policy for advisors to manage integrations
CREATE POLICY "Advisors can manage integrations" 
ON public.integration_configs 
FOR ALL 
USING (
  (advisor_id = auth.uid()) OR 
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'advisor'::text, 'asesor'::text, 'superadmin'::text]))
)
WITH CHECK (
  (advisor_id = auth.uid()) OR 
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'advisor'::text, 'asesor'::text, 'superadmin'::text]))
);

-- Add unique constraint for advisor_id + integration_type to enable upsert
ALTER TABLE public.integration_configs 
ADD CONSTRAINT unique_advisor_integration 
UNIQUE (advisor_id, integration_type);
-- Enable Row Level Security for servicios_orquest table
ALTER TABLE public.servicios_orquest ENABLE ROW LEVEL SECURITY;

-- Policy for franchisees to view services
CREATE POLICY "Franchisees can view orquest services" 
ON public.servicios_orquest 
FOR SELECT 
USING (
  CASE
    WHEN get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text]) THEN true
    ELSE (auth.uid() IS NOT NULL)
  END
);

-- Policy for admins and advisors to manage services
CREATE POLICY "Admins can manage orquest services" 
ON public.servicios_orquest 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'asesor'::text, 'advisor'::text, 'superadmin'::text]));
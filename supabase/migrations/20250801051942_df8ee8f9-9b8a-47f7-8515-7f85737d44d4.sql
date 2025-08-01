-- Critical Security Fixes - Phase 1 (Corrected)
-- Enable RLS only on actual tables, not views

-- Enable RLS on profit_loss_data
ALTER TABLE public.profit_loss_data ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profit_loss_templates  
ALTER TABLE public.profit_loss_templates ENABLE ROW LEVEL SECURITY;

-- Create basic authenticated user policies for actual tables
-- Profit Loss Data Policy
DROP POLICY IF EXISTS "Authenticated users can access profit loss data" ON public.profit_loss_data;
CREATE POLICY "Authenticated users can access profit loss data" 
ON public.profit_loss_data 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Profit Loss Templates Policy
DROP POLICY IF EXISTS "Authenticated users can access profit loss templates" ON public.profit_loss_templates;
CREATE POLICY "Authenticated users can access profit loss templates" 
ON public.profit_loss_templates 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix overly permissive policies on existing tables
-- Update quantum_account_mapping to require authentication
DROP POLICY IF EXISTS "Anyone can access quantum mappings" ON public.quantum_account_mapping;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.quantum_account_mapping;
CREATE POLICY "Authenticated users can access quantum mappings" 
ON public.quantum_account_mapping 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix restaurant_valuations and valuation_scenarios policies to be more restrictive
DROP POLICY IF EXISTS "Anyone can access restaurant valuations" ON public.restaurant_valuations;
CREATE POLICY "Authenticated users can access restaurant valuations" 
ON public.restaurant_valuations 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can access valuation scenarios" ON public.valuation_scenarios;
CREATE POLICY "Authenticated users can access valuation scenarios" 
ON public.valuation_scenarios 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
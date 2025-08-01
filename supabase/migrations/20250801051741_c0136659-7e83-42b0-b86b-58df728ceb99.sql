-- Critical Security Fixes - Phase 1
-- Enable RLS on tables that don't have it yet

-- Check and enable RLS on profit_loss_data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profit_loss_data' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.profit_loss_data ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Check and enable RLS on profit_loss_templates  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profit_loss_templates' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.profit_loss_templates ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Check and enable RLS on restaurant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'restaurant' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.restaurant ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create basic authenticated user policies for these tables
-- This is a conservative approach that requires authentication

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

-- Restaurant Policy
DROP POLICY IF EXISTS "Authenticated users can access restaurants" ON public.restaurant;
CREATE POLICY "Authenticated users can access restaurants" 
ON public.restaurant 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix overly permissive policies
-- Update quantum_account_mapping to require authentication
DROP POLICY IF EXISTS "Anyone can access quantum mappings" ON public.quantum_account_mapping;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.quantum_account_mapping;
CREATE POLICY "Authenticated users can access quantum mappings" 
ON public.quantum_account_mapping 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
-- Add biloop_company_id to franchisees table
ALTER TABLE public.franchisees 
ADD COLUMN biloop_company_id text;

-- Add comment for clarity
COMMENT ON COLUMN public.franchisees.biloop_company_id IS 'Código de empresa en BILOOP para filtrar datos específicos de cada empresa';
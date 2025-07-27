-- Crear tabla para la relación many-to-many entre franquiciados y company_ids de Biloop
CREATE TABLE public.franchisee_biloop_companies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchisee_id uuid NOT NULL REFERENCES public.franchisees(id) ON DELETE CASCADE,
  biloop_company_id text NOT NULL,
  company_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  -- Índices únicos para evitar duplicados
  UNIQUE(franchisee_id, biloop_company_id)
);

-- Habilitar RLS
ALTER TABLE public.franchisee_biloop_companies ENABLE ROW LEVEL SECURITY;

-- Política RLS para franquiciados
CREATE POLICY "Franchisees can manage their biloop companies" 
ON public.franchisee_biloop_companies 
FOR ALL 
USING (
  franchisee_id IN (
    SELECT f.id FROM franchisees f WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
)
WITH CHECK (
  franchisee_id IN (
    SELECT f.id FROM franchisees f WHERE f.user_id = auth.uid()
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

-- Función para asegurar que solo hay una company primaria por franquiciado
CREATE OR REPLACE FUNCTION public.ensure_single_primary_biloop_company()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se marca como primaria, desmarcar las demás del mismo franquiciado
  IF NEW.is_primary = true THEN
    UPDATE public.franchisee_biloop_companies 
    SET is_primary = false 
    WHERE franchisee_id = NEW.franchisee_id 
      AND id != NEW.id;
  END IF;
  
  -- Si no hay ninguna primaria, hacer ésta la primaria
  IF NOT EXISTS (
    SELECT 1 FROM public.franchisee_biloop_companies 
    WHERE franchisee_id = NEW.franchisee_id 
      AND is_primary = true 
      AND id != NEW.id
  ) THEN
    NEW.is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para la función
CREATE TRIGGER ensure_single_primary_biloop_company_trigger
  BEFORE INSERT OR UPDATE ON public.franchisee_biloop_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_primary_biloop_company();

-- Migrar datos existentes
INSERT INTO public.franchisee_biloop_companies (
  franchisee_id, 
  biloop_company_id, 
  company_name, 
  is_primary
)
SELECT 
  id,
  biloop_company_id,
  COALESCE(company_name, biloop_company_id),
  true
FROM public.franchisees 
WHERE biloop_company_id IS NOT NULL 
  AND biloop_company_id != '';

-- Crear índices para performance
CREATE INDEX idx_franchisee_biloop_companies_franchisee_id 
ON public.franchisee_biloop_companies(franchisee_id);

CREATE INDEX idx_franchisee_biloop_companies_company_id 
ON public.franchisee_biloop_companies(biloop_company_id);

CREATE INDEX idx_franchisee_biloop_companies_active 
ON public.franchisee_biloop_companies(is_active) 
WHERE is_active = true;
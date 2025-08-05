-- Crear tabla para almacenar datos de empresas de eInforma
CREATE TABLE public.company_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cif TEXT NOT NULL UNIQUE,
  razon_social TEXT,
  nombre_comercial TEXT,
  domicilio_fiscal TEXT,
  codigo_postal TEXT,
  municipio TEXT,
  provincia TEXT,
  codigo_cnae TEXT,
  descripcion_cnae TEXT,
  situacion_aeat TEXT,
  fecha_constitucion DATE,
  capital_social NUMERIC,
  forma_juridica TEXT,
  telefono TEXT,
  email TEXT,
  web TEXT,
  empleados_estimados INTEGER,
  facturacion_estimada NUMERIC,
  rating_crediticio TEXT,
  fecha_ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT now(),
  datos_adicionales JSONB DEFAULT '{}',
  validado_einforma BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_company_data_cif ON public.company_data(cif);
CREATE INDEX idx_company_data_validado ON public.company_data(validado_einforma);
CREATE INDEX idx_company_data_updated ON public.company_data(fecha_ultima_actualizacion);

-- Habilitar RLS
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para company_data
CREATE POLICY "Authenticated users can view company data" 
ON public.company_data FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage company data" 
ON public.company_data FOR ALL 
USING (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

CREATE POLICY "Franchisees can manage their company data" 
ON public.company_data FOR ALL 
USING (
  cif IN (
    SELECT br.company_tax_id 
    FROM base_restaurants br 
    JOIN franchisee_restaurants fr ON fr.base_restaurant_id = br.id
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid()
  )
  OR
  cif IN (
    SELECT f.tax_id 
    FROM franchisees f 
    WHERE f.user_id = auth.uid()
  )
);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION public.update_company_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp automáticamente
CREATE TRIGGER update_company_data_updated_at
  BEFORE UPDATE ON public.company_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_data_updated_at();
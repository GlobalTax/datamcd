-- Ensure company_data table exists with proper structure
CREATE TABLE IF NOT EXISTS public.company_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cif VARCHAR(9) NOT NULL UNIQUE,
    razon_social TEXT,
    nombre_comercial TEXT,
    domicilio_fiscal TEXT,
    codigo_postal VARCHAR(10),
    municipio TEXT,
    provincia TEXT,
    codigo_cnae VARCHAR(10),
    descripcion_cnae TEXT,
    situacion_aeat TEXT,
    fecha_constitucion DATE,
    capital_social DECIMAL(15,2),
    forma_juridica TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    web VARCHAR(255),
    empleados_estimados INTEGER,
    facturacion_estimada DECIMAL(15,2),
    rating_crediticio VARCHAR(10),
    fecha_ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT now(),
    datos_adicionales JSONB,
    validado_einforma BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

-- Create policies for company_data access
CREATE POLICY "Authenticated users can view company data" 
ON public.company_data 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert company data" 
ON public.company_data 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company data" 
ON public.company_data 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create index for faster CIF lookups
CREATE INDEX IF NOT EXISTS idx_company_data_cif ON public.company_data(cif);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_company_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.fecha_ultima_actualizacion = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_company_data_updated_at ON public.company_data;
CREATE TRIGGER update_company_data_updated_at
    BEFORE UPDATE ON public.company_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_company_data_updated_at();

-- Add company_tax_id to base_restaurants if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'base_restaurants' 
        AND column_name = 'company_tax_id'
    ) THEN
        ALTER TABLE public.base_restaurants ADD COLUMN company_tax_id VARCHAR(9);
    END IF;
END $$;
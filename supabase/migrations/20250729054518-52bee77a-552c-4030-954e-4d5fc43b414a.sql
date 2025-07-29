-- Crear tabla de contactos/proveedores
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('ingeniero', 'arquitecto', 'proveedor', 'tecnico', 'constructor', 'otro')),
  specialization TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Crear índices para mejorar performance
CREATE INDEX idx_contacts_type ON public.contacts(contact_type);
CREATE INDEX idx_contacts_active ON public.contacts(is_active);
CREATE INDEX idx_contacts_name ON public.contacts(name);

-- Habilitar RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios autenticados puedan gestionar contactos
CREATE POLICY "Authenticated users can manage contacts" 
ON public.contacts 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contacts_updated_at();
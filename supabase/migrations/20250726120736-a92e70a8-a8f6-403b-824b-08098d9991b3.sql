-- Crear tabla restaurant_incidents con todos los campos necesarios
CREATE TABLE public.restaurant_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('general', 'equipment', 'staff', 'customer', 'safety', 'hygiene')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  restaurant_id UUID NOT NULL REFERENCES public.franchisee_restaurants(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  estimated_resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.restaurant_incidents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para restaurant_incidents
CREATE POLICY "Franchisees can view incidents from their restaurants" 
ON public.restaurant_incidents 
FOR SELECT 
USING (
  restaurant_id IN (
    SELECT fr.id 
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR user_is_staff_of_franchisee(f.id)
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

CREATE POLICY "Franchisees can create incidents for their restaurants" 
ON public.restaurant_incidents 
FOR INSERT 
WITH CHECK (
  restaurant_id IN (
    SELECT fr.id 
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR user_is_staff_of_franchisee(f.id)
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

CREATE POLICY "Franchisees can update incidents from their restaurants" 
ON public.restaurant_incidents 
FOR UPDATE 
USING (
  restaurant_id IN (
    SELECT fr.id 
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR user_is_staff_of_franchisee(f.id)
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'superadmin'])
);

CREATE POLICY "Admins can delete incidents" 
ON public.restaurant_incidents 
FOR DELETE 
USING (get_current_user_role() = ANY(ARRAY['admin', 'superadmin']));

-- Crear índices para optimizar consultas
CREATE INDEX idx_restaurant_incidents_restaurant_id ON public.restaurant_incidents(restaurant_id);
CREATE INDEX idx_restaurant_incidents_status ON public.restaurant_incidents(status);
CREATE INDEX idx_restaurant_incidents_priority ON public.restaurant_incidents(priority);
CREATE INDEX idx_restaurant_incidents_created_at ON public.restaurant_incidents(created_at DESC);
CREATE INDEX idx_restaurant_incidents_reported_by ON public.restaurant_incidents(reported_by);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurant_incidents_updated_at
  BEFORE UPDATE ON public.restaurant_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función auxiliar para verificar si el usuario es staff de un franquiciado
CREATE OR REPLACE FUNCTION public.user_is_staff_of_franchisee(franchisee_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM franchisee_staff fs
    WHERE fs.franchisee_id = $1 AND fs.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
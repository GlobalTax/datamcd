-- Crear tabla para gestión de incidencias en restaurantes
CREATE TABLE public.restaurant_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  incident_type TEXT NOT NULL DEFAULT 'general', -- general, equipment, staff, customer, safety, hygiene
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
  restaurant_id UUID NOT NULL,
  reported_by UUID NOT NULL,
  assigned_to UUID,
  resolution_notes TEXT,
  estimated_resolution DATE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.restaurant_incidents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para incidencias
CREATE POLICY "Franchisees can manage incidents in their restaurants" 
ON public.restaurant_incidents 
FOR ALL 
USING (
  restaurant_id IN (
    SELECT fr.id 
    FROM franchisee_restaurants fr
    JOIN franchisees f ON f.id = fr.franchisee_id
    WHERE f.user_id = auth.uid() OR user_is_staff_of_franchisee(f.id)
  )
);

CREATE POLICY "Advisors can view all incidents" 
ON public.restaurant_incidents 
FOR SELECT 
USING (get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin']));

-- Crear tabla para comentarios de incidencias
CREATE TABLE public.incident_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.restaurant_incidents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false, -- para distinguir comentarios internos vs públicos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para comentarios
ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comentarios
CREATE POLICY "Users can manage comments on accessible incidents" 
ON public.incident_comments 
FOR ALL 
USING (
  incident_id IN (
    SELECT id FROM public.restaurant_incidents
    WHERE restaurant_id IN (
      SELECT fr.id 
      FROM franchisee_restaurants fr
      JOIN franchisees f ON f.id = fr.franchisee_id
      WHERE f.user_id = auth.uid() OR user_is_staff_of_franchisee(f.id)
    )
  ) OR get_current_user_role() = ANY(ARRAY['admin', 'asesor', 'advisor', 'superadmin'])
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_incident_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_restaurant_incidents_updated_at
  BEFORE UPDATE ON public.restaurant_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_incident_updated_at();

-- Índices para mejorar performance
CREATE INDEX idx_restaurant_incidents_restaurant_id ON public.restaurant_incidents(restaurant_id);
CREATE INDEX idx_restaurant_incidents_status ON public.restaurant_incidents(status);
CREATE INDEX idx_restaurant_incidents_priority ON public.restaurant_incidents(priority);
CREATE INDEX idx_restaurant_incidents_created_at ON public.restaurant_incidents(created_at);
CREATE INDEX idx_incident_comments_incident_id ON public.incident_comments(incident_id);
-- Modificar tabla integration_configs para vincular configuraciones a franquiciados
-- Primero eliminar el constraint anterior
ALTER TABLE public.integration_configs 
DROP CONSTRAINT IF EXISTS unique_advisor_integration;

-- Agregar columna franchisee_id
ALTER TABLE public.integration_configs 
ADD COLUMN franchisee_id UUID REFERENCES public.franchisees(id) ON DELETE CASCADE;

-- Crear nuevo constraint único para franquiciado + tipo de integración
ALTER TABLE public.integration_configs 
ADD CONSTRAINT unique_franchisee_integration 
UNIQUE (franchisee_id, integration_type);

-- Eliminar política anterior
DROP POLICY IF EXISTS "Advisors can manage integrations" ON public.integration_configs;

-- Crear nueva política para configuraciones por franquiciado
CREATE POLICY "Franchisee integration configs access" 
ON public.integration_configs 
FOR ALL 
USING (
  -- Advisors pueden ver/gestionar configuraciones de todos los franquiciados
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'advisor'::text, 'asesor'::text, 'superadmin'::text])) OR
  -- Franquiciados pueden ver/gestionar solo sus propias configuraciones
  (franchisee_id IN (
    SELECT id FROM public.franchisees WHERE user_id = auth.uid()
  ))
)
WITH CHECK (
  -- Advisors pueden crear/actualizar configuraciones para cualquier franquiciado
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'advisor'::text, 'asesor'::text, 'superadmin'::text])) OR
  -- Franquiciados pueden crear/actualizar solo sus propias configuraciones
  (franchisee_id IN (
    SELECT id FROM public.franchisees WHERE user_id = auth.uid()
  ))
);
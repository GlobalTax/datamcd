-- Limpiar datos inconsistentes primero
DELETE FROM restaurant_incidents WHERE restaurant_id NOT IN (SELECT id FROM base_restaurants);

-- Ahora migrar los datos válidos
INSERT INTO incidents (
  title,
  description,
  type,
  priority,
  status,
  restaurant_id,
  reported_by,
  assigned_to,
  estimated_resolution,
  resolution_notes,
  resolved_at,
  created_at,
  updated_at,
  source
)
SELECT 
  title,
  incident_type as type,
  description,
  priority,
  status,
  restaurant_id,
  reported_by,
  assigned_to,
  estimated_resolution,
  resolution_notes,
  resolved_at,
  created_at,
  updated_at,
  'manual' as source
FROM restaurant_incidents
WHERE restaurant_id IN (SELECT id FROM base_restaurants)
ON CONFLICT DO NOTHING;

-- Crear algunos datos de prueba
INSERT INTO incidents (
  title,
  description,
  type,
  priority,
  status,
  restaurant_id,
  reported_by,
  source
) VALUES 
(
  'Problema con aire acondicionado',
  'El aire acondicionado de la sala principal no funciona correctamente',
  'climatizacion',
  'high',
  'open',
  'd3a669b9-030c-41f0-9cb3-0818ea2d058f',
  '8cace681-34d1-4457-9e29-78661726a286',
  'manual'
),
(
  'Fuga de agua en cocina',
  'Se ha detectado una fuga de agua en la zona de preparación',
  'fontaneria',
  'critical',
  'in_progress',
  '30e7727f-9e20-4e80-9c9e-dd8782067b85',
  '8cace681-34d1-4457-9e29-78661726a286',
  'manual'
),
(
  'Mantenimiento equipos frío',
  'Revisión preventiva de equipos de refrigeración',
  'mantenimiento',
  'medium',
  'pending',
  'c1d4cf59-4f7a-4f9d-80e2-4f5ec9d396e1',
  '8cace681-34d1-4457-9e29-78661726a286',
  'manual'
)
ON CONFLICT DO NOTHING;

-- Crear proveedores de ejemplo
INSERT INTO providers (name, contact_email, contact_phone, provider_type, is_active)
VALUES 
('Climatización Madrid S.L.', 'info@climatizacionmadrid.com', '+34 91 123 4567', 'climatizacion', true),
('Fontanería Express', 'contacto@fontaneriaexpress.es', '+34 91 987 6543', 'fontaneria', true),
('Mantenimiento Integral', 'admin@mantenimientointegral.com', '+34 91 555 0123', 'mantenimiento', true)
ON CONFLICT (name) DO NOTHING;
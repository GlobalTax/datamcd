-- Migrar datos de restaurant_incidents a incidents
INSERT INTO incidents (
  title,
  description,
  type,
  priority,
  status,
  restaurant_id,
  provider_id,
  reported_by,
  assigned_to,
  estimated_resolution,
  resolution_notes,
  resolved_at,
  created_at,
  updated_at,
  source,
  nombre,
  naves,
  ingeniero,
  clasificacion,
  participante,
  periodo,
  importe_carto,
  documento_url,
  fecha_cierre,
  comentarios_cierre
)
SELECT 
  title,
  description,
  incident_type as type,
  priority,
  status,
  restaurant_id,
  NULL as provider_id,
  reported_by,
  assigned_to,
  estimated_resolution,
  resolution_notes,
  resolved_at,
  created_at,
  updated_at,
  'manual' as source,
  nombre,
  naves,
  ingeniero,
  clasificacion,
  participante,
  periodo,
  importe_carto,
  documento_url,
  fecha_cierre,
  comentarios_cierre
FROM restaurant_incidents
WHERE NOT EXISTS (
  SELECT 1 FROM incidents i WHERE i.title = restaurant_incidents.title AND i.restaurant_id = restaurant_incidents.restaurant_id
);

-- Crear algunos datos de prueba adicionales
INSERT INTO incidents (
  title,
  description,
  type,
  priority,
  status,
  restaurant_id,
  reported_by,
  source,
  created_at,
  updated_at
) VALUES 
(
  'Problema con aire acondicionado',
  'El aire acondicionado de la sala principal no funciona correctamente',
  'climatizacion',
  'high',
  'open',
  'd3a669b9-030c-41f0-9cb3-0818ea2d058f',
  '62bdec15-90ae-4339-8416-39c847aee996',
  'manual',
  now(),
  now()
),
(
  'Fuga de agua en cocina',
  'Se ha detectado una fuga de agua en la zona de preparación',
  'fontaneria',
  'critical',
  'in_progress',
  '30e7727f-9e20-4e80-9c9e-dd8782067b85',
  '62bdec15-90ae-4339-8416-39c847aee996',
  'manual',
  now(),
  now()
),
(
  'Mantenimiento equipos frío',
  'Revisión preventiva de equipos de refrigeración',
  'mantenimiento',
  'medium',
  'pending',
  'c1d4cf59-4f7a-4f9d-80e2-4f5ec9d396e1',
  '62bdec15-90ae-4339-8416-39c847aee996',
  'manual',
  now(),
  now()
);

-- Crear tabla de proveedores con datos de ejemplo
INSERT INTO providers (name, contact_email, contact_phone, provider_type, is_active, created_by)
VALUES 
('Climatización Madrid S.L.', 'info@climatizacionmadrid.com', '+34 91 123 4567', 'climatizacion', true, '62bdec15-90ae-4339-8416-39c847aee996'),
('Fontanería Express', 'contacto@fontaneriaexpress.es', '+34 91 987 6543', 'fontaneria', true, '62bdec15-90ae-4339-8416-39c847aee996'),
('Mantenimiento Integral', 'admin@mantenimientointegral.com', '+34 91 555 0123', 'mantenimiento', true, '62bdec15-90ae-4339-8416-39c847aee996')
ON CONFLICT (name) DO NOTHING;
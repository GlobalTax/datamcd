-- Insertar restaurantes de ejemplo
INSERT INTO public.base_restaurants (site_number, restaurant_name, address, city, state, postal_code, country, franchisee_name, restaurant_type) VALUES
('188', 'McDonald''s San Blas', 'Av. de la Ciudad de Barcelona, 188', 'Madrid', 'Madrid', '28007', 'España', 'Grupo San Blas S.L.', 'traditional'),
('43', 'McDonald''s Cuatro Caminos', 'C/ Bravo Murillo, 43', 'Madrid', 'Madrid', '28015', 'España', 'Franquicias Norte S.L.', 'traditional'),
('2', 'McDonald''s Alcalá', 'C/ Alcalá, 2', 'Madrid', 'Madrid', '28014', 'España', 'Madrid Centro S.L.', 'traditional'),
('156', 'McDonald''s Goya', 'C/ Goya, 156', 'Madrid', 'Madrid', '28009', 'España', 'Goya Restauración S.L.', 'traditional'),
('78', 'McDonald''s Atocha', 'Ronda de Atocha, 78', 'Madrid', 'Madrid', '28012', 'España', 'Atocha Fast Food S.L.', 'traditional');

-- Crear algunos proveedores de ejemplo
INSERT INTO public.providers (name, provider_type, contact_email, contact_phone) VALUES
('Instalaciones Gómez S.L.', 'mantenimiento', 'contacto@instalacionesgomez.es', '+34 91 234 5678'),
('ElectroServicios Madrid', 'electricidad', 'info@electroservicios.es', '+34 91 345 6789'),
('Fontanería Rápida', 'fontaneria', 'pedidos@fontaneriarpida.es', '+34 91 456 7890'),
('ClimaTech Solutions', 'climatizacion', 'soporte@climatech.es', '+34 91 567 8901'),
('Obras y Reformas Plaza', 'obras', 'proyectos@obrasplaza.es', '+34 91 678 9012');

-- Insertar incidencias de ejemplo basadas en el Excel
WITH restaurant_ids AS (
  SELECT id, site_number FROM public.base_restaurants WHERE site_number IN ('188', '43', '2', '156', '78')
),
provider_ids AS (
  SELECT id, name FROM public.providers
)
INSERT INTO public.incidents (
  title, 
  description, 
  type, 
  priority, 
  status, 
  restaurant_id, 
  provider_id, 
  participante, 
  ingeniero, 
  clasificacion, 
  periodo, 
  importe_carto, 
  numero_pedido, 
  fecha_cierre, 
  comentarios_cierre,
  created_at,
  updated_at
) 
SELECT 
  CASE 
    WHEN r.site_number = '188' THEN 'Reparación sistema aire acondicionado'
    WHEN r.site_number = '43' THEN 'Avería en cámaras frigoríficas'
    WHEN r.site_number = '2' THEN 'Mantenimiento preventivo equipos cocina'
    WHEN r.site_number = '156' THEN 'Instalación nueva campana extractora'
    WHEN r.site_number = '78' THEN 'Reparación sistema eléctrico'
  END as title,
  CASE 
    WHEN r.site_number = '188' THEN 'Sistema de climatización presenta problemas de refrigeración en zona de comensales. Requiere revisión urgente del compresor principal.'
    WHEN r.site_number = '43' THEN 'Las cámaras frigoríficas no mantienen la temperatura adecuada. Posible avería en el sistema de control.'
    WHEN r.site_number = '2' THEN 'Mantenimiento programado de equipos de cocina según calendario preventivo.'
    WHEN r.site_number = '156' THEN 'Instalación de nueva campana extractora en zona de freidoras según normativa actualizada.'
    WHEN r.site_number = '78' THEN 'Cortes intermitentes de electricidad en zona de caja. Revisión del cuadro eléctrico principal.'
  END as description,
  CASE 
    WHEN r.site_number IN ('188', '43') THEN 'climatizacion'
    WHEN r.site_number = '2' THEN 'mantenimiento'
    WHEN r.site_number = '156' THEN 'equipamiento'
    WHEN r.site_number = '78' THEN 'electricidad'
  END as type,
  CASE 
    WHEN r.site_number IN ('43', '78') THEN 'high'
    WHEN r.site_number = '188' THEN 'medium'
    ELSE 'low'
  END as priority,
  CASE 
    WHEN r.site_number = '188' THEN 'closed'
    WHEN r.site_number = '43' THEN 'in_progress'
    WHEN r.site_number = '2' THEN 'resolved'
    WHEN r.site_number = '156' THEN 'open'
    WHEN r.site_number = '78' THEN 'in_progress'
  END as status,
  r.id as restaurant_id,
  p.id as provider_id,
  CASE 
    WHEN r.site_number = '188' THEN 'ClimaTech Solutions'
    WHEN r.site_number = '43' THEN 'Instalaciones Gómez S.L.'
    WHEN r.site_number = '2' THEN 'Instalaciones Gómez S.L.'
    WHEN r.site_number = '156' THEN 'ElectroServicios Madrid'
    WHEN r.site_number = '78' THEN 'ElectroServicios Madrid'
  END as participante,
  CASE 
    WHEN r.site_number IN ('188', '43') THEN 'Juan Carlos Martín'
    WHEN r.site_number = '2' THEN 'Ana López García'
    WHEN r.site_number = '156' THEN 'Roberto Sánchez'
    WHEN r.site_number = '78' THEN 'Miguel Fernández'
  END as ingeniero,
  CASE 
    WHEN r.site_number IN ('188', '43') THEN 'HVAC'
    WHEN r.site_number = '2' THEN 'Preventivo'
    WHEN r.site_number = '156' THEN 'Instalación'
    WHEN r.site_number = '78' THEN 'Urgente'
  END as clasificacion,
  '2024-01' as periodo,
  CASE 
    WHEN r.site_number = '188' THEN 2450.00
    WHEN r.site_number = '43' THEN 1875.50
    WHEN r.site_number = '2' THEN 320.00
    WHEN r.site_number = '156' THEN 4200.00
    WHEN r.site_number = '78' THEN 890.75
  END as importe_carto,
  CASE 
    WHEN r.site_number = '188' THEN 'PED-2024-0156'
    WHEN r.site_number = '43' THEN 'PED-2024-0187'
    WHEN r.site_number = '2' THEN 'PED-2024-0201'
    WHEN r.site_number = '156' THEN 'PED-2024-0234'
    WHEN r.site_number = '78' THEN 'PED-2024-0298'
  END as numero_pedido,
  CASE 
    WHEN r.site_number = '188' THEN now() - interval '5 days'
    WHEN r.site_number = '2' THEN now() - interval '2 days'
    ELSE NULL
  END as fecha_cierre,
  CASE 
    WHEN r.site_number = '188' THEN 'Reparación completada. Sistema funcionando correctamente. Se recomienda revisión en 6 meses.'
    WHEN r.site_number = '2' THEN 'Mantenimiento realizado según protocolo. Todos los equipos operativos.'
    ELSE NULL
  END as comentarios_cierre,
  CASE 
    WHEN r.site_number = '188' THEN now() - interval '10 days'
    WHEN r.site_number = '43' THEN now() - interval '8 days'
    WHEN r.site_number = '2' THEN now() - interval '7 days'
    WHEN r.site_number = '156' THEN now() - interval '5 days'
    WHEN r.site_number = '78' THEN now() - interval '3 days'
  END as created_at,
  now() as updated_at
FROM restaurant_ids r
CROSS JOIN (SELECT id, name FROM provider_ids LIMIT 1) p;
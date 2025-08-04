-- Asignar algunos restaurantes de prueba al franquiciado "Nuevo Franquiciado"
-- para que pueda acceder a los paneles de restaurantes

-- Primero, asignar el restaurante Alcalá (id: d3a669b9-030c-41f0-9cb3-0818ea2d058f)
INSERT INTO franchisee_restaurants (
  franchisee_id,
  base_restaurant_id,
  status,
  assigned_at,
  franchise_start_date,
  franchise_end_date,
  monthly_rent,
  last_year_revenue,
  franchise_fee_percentage,
  advertising_fee_percentage,
  notes
) VALUES (
  'e1e40647-eb42-4263-8af1-9e7873894674',
  'd3a669b9-030c-41f0-9cb3-0818ea2d058f',
  'active',
  now(),
  '2024-01-01',
  '2034-01-01',
  12000,
  850000,
  4.0,
  4.0,
  'Restaurante de prueba - Alcalá Madrid'
);

-- Asignar el restaurante Cuatro Caminos
INSERT INTO franchisee_restaurants (
  franchisee_id,
  base_restaurant_id,
  status,
  assigned_at,
  franchise_start_date,
  franchise_end_date,
  monthly_rent,
  last_year_revenue,
  franchise_fee_percentage,
  advertising_fee_percentage,
  notes
) VALUES (
  'e1e40647-eb42-4263-8af1-9e7873894674',
  '30e7727f-9e20-4e80-9c9e-dd8782067b85',
  'active',
  now(),
  '2024-01-01',
  '2034-01-01',
  15000,
  920000,
  4.0,
  4.0,
  'Restaurante de prueba - Cuatro Caminos Madrid'
);

-- Asignar el restaurante San Blas
INSERT INTO franchisee_restaurants (
  franchisee_id,
  base_restaurant_id,
  status,
  assigned_at,
  franchise_start_date,
  franchise_end_date,
  monthly_rent,
  last_year_revenue,
  franchise_fee_percentage,
  advertising_fee_percentage,
  notes
) VALUES (
  'e1e40647-eb42-4263-8af1-9e7873894674',
  'c1d4cf59-4f7a-4f9d-80e2-4f5ec9d396e1',
  'active',
  now(),
  '2024-01-01',
  '2034-01-01',
  13500,
  780000,
  4.0,
  4.0,
  'Restaurante de prueba - San Blas Madrid'
);

-- Actualizar el campo franchisee_name en base_restaurants para que coincida
UPDATE base_restaurants 
SET franchisee_name = 'Nuevo Franquiciado'
WHERE id IN (
  'd3a669b9-030c-41f0-9cb3-0818ea2d058f',
  '30e7727f-9e20-4e80-9c9e-dd8782067b85', 
  'c1d4cf59-4f7a-4f9d-80e2-4f5ec9d396e1'
);
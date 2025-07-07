-- Asignar algunos restaurantes al franquiciado S. Navarro para pruebas
INSERT INTO public.franchisee_restaurants (
  franchisee_id,
  base_restaurant_id,
  monthly_rent,
  last_year_revenue,
  franchise_fee_percentage,
  advertising_fee_percentage,
  status,
  assigned_at
) VALUES 
(
  '3a99185e-796a-410e-a04b-38e7e8a5c02d',
  'd3a669b9-030c-41f0-9cb3-0818ea2d058f',
  8000,
  450000,
  4.0,
  4.0,
  'active',
  now()
),
(
  '3a99185e-796a-410e-a04b-38e7e8a5c02d',
  '30e7727f-9e20-4e80-9c9e-dd8782067b85',
  9500,
  520000,
  4.0,
  4.0,
  'active',
  now()
),
(
  '3a99185e-796a-410e-a04b-38e7e8a5c02d',
  'c1d4cf59-4f7a-4f9d-80e2-4f5ec9d396e1',
  12000,
  380000,
  4.0,
  4.0,
  'active',
  now()
)
ON CONFLICT (franchisee_id, base_restaurant_id) DO NOTHING;

-- Crear un franquiciado para el usuario s.navarro@obn.es si no existe
INSERT INTO public.franchisees (
  user_id,
  franchisee_name,
  company_name,
  city,
  country,
  total_restaurants
)
SELECT 
  p.id,
  'S. Navarro Franquicias',
  'S. Navarro Restaurant Group S.L.',
  'Barcelona',
  'España',
  0
FROM public.profiles p
WHERE p.email = 's.navarro@obn.es'
AND NOT EXISTS (
  SELECT 1 FROM public.franchisees f WHERE f.user_id = p.id
);

-- Crear algunos restaurantes base para este franquiciado
INSERT INTO public.base_restaurants (
  site_number,
  restaurant_name,
  address,
  city,
  state,
  postal_code,
  country,
  restaurant_type,
  square_meters,
  seating_capacity,
  franchisee_name,
  franchisee_email
) VALUES 
(
  'SN001',
  'McDonald''s Diagonal Barcelona',
  'Avinguda Diagonal, 208',
  'Barcelona',
  'Barcelona',
  '08018',
  'España',
  'traditional',
  200,
  85,
  'S. Navarro Franquicias',
  's.navarro@obn.es'
),
(
  'SN002',
  'McDonald''s Sagrada Familia',
  'Carrer de Mallorca, 401',
  'Barcelona',
  'Barcelona',
  '08013',
  'España',
  'traditional',
  180,
  70,
  'S. Navarro Franquicias',
  's.navarro@obn.es'
),
(
  'SN003',
  'McDonald''s Port Olimpic',
  'Moll de Gregal, 14',
  'Barcelona',
  'Barcelona',
  '08005',
  'España',
  'drive_thru',
  250,
  100,
  'S. Navarro Franquicias',
  's.navarro@obn.es'
)
ON CONFLICT (site_number) DO NOTHING;

-- Asignar estos restaurantes al franquiciado
WITH target_franchisee AS (
  SELECT f.id as franchisee_id
  FROM public.franchisees f
  JOIN public.profiles p ON p.id = f.user_id
  WHERE p.email = 's.navarro@obn.es'
  LIMIT 1
),
navarro_restaurants AS (
  SELECT id as restaurant_id, site_number
  FROM public.base_restaurants
  WHERE site_number IN ('SN001', 'SN002', 'SN003')
)
INSERT INTO public.franchisee_restaurants (
  franchisee_id,
  base_restaurant_id,
  franchise_start_date,
  franchise_end_date,
  monthly_rent,
  last_year_revenue,
  status
)
SELECT 
  tf.franchisee_id,
  nr.restaurant_id,
  '2021-03-01'::date,
  '2031-02-28'::date,
  CASE 
    WHEN nr.site_number = 'SN001' THEN 11500.00
    WHEN nr.site_number = 'SN002' THEN 9800.00
    WHEN nr.site_number = 'SN003' THEN 13200.00
  END,
  CASE 
    WHEN nr.site_number = 'SN001' THEN 1150000.00
    WHEN nr.site_number = 'SN002' THEN 980000.00
    WHEN nr.site_number = 'SN003' THEN 1320000.00
  END,
  'active'
FROM target_franchisee tf
CROSS JOIN navarro_restaurants nr
WHERE NOT EXISTS (
  SELECT 1 FROM public.franchisee_restaurants fr 
  WHERE fr.franchisee_id = tf.franchisee_id 
  AND fr.base_restaurant_id = nr.restaurant_id
);

-- Actualizar el contador de restaurantes del franquiciado
UPDATE public.franchisees 
SET total_restaurants = (
  SELECT COUNT(*) 
  FROM public.franchisee_restaurants fr 
  WHERE fr.franchisee_id = franchisees.id 
  AND fr.status = 'active'
)
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE email = 's.navarro@obn.es'
);

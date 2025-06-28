
-- Optimización crítica: Añadir índices para resolver timeouts en consultas principales

-- 1. Índice para la tabla profiles (crítico para autenticación)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- 2. Índice para la tabla franchisees (crítico para carga de datos del franquiciado)
CREATE INDEX IF NOT EXISTS idx_franchisees_user_id_optimized ON public.franchisees(user_id);

-- 3. Índice para franchisee_restaurants (crítico para carga de restaurantes)
CREATE INDEX IF NOT EXISTS idx_franchisee_restaurants_franchisee_id_optimized ON public.franchisee_restaurants(franchisee_id);

-- 4. Índice compuesto para franchisee_restaurants con base_restaurant
CREATE INDEX IF NOT EXISTS idx_franchisee_restaurants_base_restaurant_optimized ON public.franchisee_restaurants(base_restaurant_id);

-- 5. Índice para la tabla base_restaurants (para joins más rápidos)
CREATE INDEX IF NOT EXISTS idx_base_restaurants_id ON public.base_restaurants(id);

-- 6. Optimizar consultas de estado activo
CREATE INDEX IF NOT EXISTS idx_franchisee_restaurants_status ON public.franchisee_restaurants(status) WHERE status = 'active';

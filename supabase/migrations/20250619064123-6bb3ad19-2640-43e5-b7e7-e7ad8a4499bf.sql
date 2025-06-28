
-- Limpieza final de optimización

-- 1. Crear índice para la clave foránea que lo necesita
CREATE INDEX IF NOT EXISTS idx_restaurants_franchisee_id ON public.restaurants(franchisee_id);

-- 2. Eliminar índices no utilizados
DROP INDEX IF EXISTS idx_franchisee_restaurants_franchisee_id;
DROP INDEX IF EXISTS idx_franchisee_restaurants_base_restaurant_id_critical;

-- 3. Crear solo el índice realmente necesario para franchisee_restaurants
CREATE INDEX IF NOT EXISTS idx_franchisee_restaurants_base_restaurant_id ON public.franchisee_restaurants(base_restaurant_id);

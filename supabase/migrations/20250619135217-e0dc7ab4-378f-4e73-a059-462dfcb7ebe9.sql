
-- Eliminar índices no utilizados que pueden estar afectando el rendimiento
DROP INDEX IF EXISTS idx_restaurants_franchisee_id;
DROP INDEX IF EXISTS idx_franchisee_restaurants_base_restaurant_id;

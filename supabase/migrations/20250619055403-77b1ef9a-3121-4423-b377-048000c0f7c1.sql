
-- Limpieza conservadora de índices: mantener solo los más críticos para el funcionamiento actual

-- Eliminar índices que no son críticos para el funcionamiento actual
DROP INDEX IF EXISTS idx_annual_budgets_created_by;
DROP INDEX IF EXISTS idx_base_restaurants_created_by;
DROP INDEX IF EXISTS idx_franchisee_access_log_user_id;
DROP INDEX IF EXISTS idx_franchisee_activity_log_user_id;
DROP INDEX IF EXISTS idx_franchisee_invitations_invited_by;
DROP INDEX IF EXISTS idx_monthly_tracking_created_by;
DROP INDEX IF EXISTS idx_restaurant_budgets_created_by;
DROP INDEX IF EXISTS idx_restaurant_valuations_created_by;
DROP INDEX IF EXISTS idx_profit_loss_data_restaurant_year_month;
DROP INDEX IF EXISTS idx_franchisee_invitations_franchisee_status;
DROP INDEX IF EXISTS idx_franchisee_access_log_franchisee_login;
DROP INDEX IF EXISTS idx_franchisee_activity_log_franchisee_type;

-- Mantener solo los índices más críticos para las relaciones principales:
-- 1. franchisees.user_id (crítico para autenticación)
-- 2. franchisee_restaurants.base_restaurant_id (crítico para joins principales)
-- 3. restaurants.franchisee_id (crítico para consultas del dashboard)

-- Estos tres índices son los únicos que mantenemos porque son esenciales para:
-- - Autenticación de usuarios
-- - Carga del dashboard principal
-- - Relaciones entre franquiciados y restaurantes

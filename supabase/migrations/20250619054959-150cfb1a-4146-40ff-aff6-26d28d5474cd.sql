
-- Optimización de rendimiento: Agregar índices para claves foráneas y limpiar índices no utilizados

-- 1. Crear índices para claves foráneas que los necesitan
CREATE INDEX IF NOT EXISTS idx_annual_budgets_created_by ON public.annual_budgets(created_by);
CREATE INDEX IF NOT EXISTS idx_base_restaurants_created_by ON public.base_restaurants(created_by);
CREATE INDEX IF NOT EXISTS idx_franchisee_access_log_user_id ON public.franchisee_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_franchisee_activity_log_user_id ON public.franchisee_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_franchisee_invitations_invited_by ON public.franchisee_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_franchisee_restaurants_base_restaurant_id ON public.franchisee_restaurants(base_restaurant_id);
CREATE INDEX IF NOT EXISTS idx_franchisees_user_id ON public.franchisees(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_tracking_created_by ON public.monthly_tracking(created_by);
CREATE INDEX IF NOT EXISTS idx_restaurant_budgets_created_by ON public.restaurant_budgets(created_by);
CREATE INDEX IF NOT EXISTS idx_restaurant_valuations_created_by ON public.restaurant_valuations(created_by);
CREATE INDEX IF NOT EXISTS idx_restaurants_franchisee_id ON public.restaurants(franchisee_id);

-- 2. Eliminar índices no utilizados
DROP INDEX IF EXISTS idx_profit_loss_restaurant_year;
DROP INDEX IF EXISTS idx_valuation_budgets_year;
DROP INDEX IF EXISTS idx_franchisee_invitations_status;
DROP INDEX IF EXISTS idx_franchisee_access_log_login_time;
DROP INDEX IF EXISTS idx_franchisee_activity_log_created_at;

-- 3. Crear índices compuestos más útiles que reemplacen algunos de los eliminados
CREATE INDEX IF NOT EXISTS idx_profit_loss_data_restaurant_year_month ON public.profit_loss_data(restaurant_id, year, month);
CREATE INDEX IF NOT EXISTS idx_franchisee_invitations_franchisee_status ON public.franchisee_invitations(franchisee_id, status);
CREATE INDEX IF NOT EXISTS idx_franchisee_access_log_franchisee_login ON public.franchisee_access_log(franchisee_id, login_time);
CREATE INDEX IF NOT EXISTS idx_franchisee_activity_log_franchisee_type ON public.franchisee_activity_log(franchisee_id, activity_type);

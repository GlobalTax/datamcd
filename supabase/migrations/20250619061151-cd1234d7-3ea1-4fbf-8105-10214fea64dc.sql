
-- Estrategia definitiva: Eliminar claves foráneas no esenciales y optimizar solo lo crítico

-- 1. Eliminar claves foráneas de campos 'created_by' que no son críticas
ALTER TABLE public.annual_budgets DROP CONSTRAINT IF EXISTS annual_budgets_created_by_fkey;
ALTER TABLE public.base_restaurants DROP CONSTRAINT IF EXISTS base_restaurants_created_by_fkey;
ALTER TABLE public.franchisee_access_log DROP CONSTRAINT IF EXISTS franchisee_access_log_user_id_fkey;
ALTER TABLE public.franchisee_activity_log DROP CONSTRAINT IF EXISTS franchisee_activity_log_user_id_fkey;
ALTER TABLE public.franchisee_invitations DROP CONSTRAINT IF EXISTS franchisee_invitations_invited_by_fkey;
ALTER TABLE public.monthly_tracking DROP CONSTRAINT IF EXISTS monthly_tracking_created_by_fkey;
ALTER TABLE public.restaurant_budgets DROP CONSTRAINT IF EXISTS restaurant_budgets_created_by_fkey;
ALTER TABLE public.restaurant_valuations DROP CONSTRAINT IF EXISTS restaurant_valuations_created_by_fkey;

-- 2. Eliminar también los índices restantes que no se usan
DROP INDEX IF EXISTS idx_franchisee_restaurants_base_restaurant_id;
DROP INDEX IF EXISTS idx_restaurants_franchisee_id;

-- 3. Mantener SOLO el índice más crítico para autenticación
-- idx_franchisees_user_id ya existe y es el único que necesitamos

-- 4. Verificar que las claves foráneas realmente críticas tengan sus índices
-- Estas son las únicas FK que mantenemos porque son esenciales:
CREATE INDEX IF NOT EXISTS idx_franchisee_restaurants_franchisee_id ON public.franchisee_restaurants(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_franchisee_restaurants_base_restaurant_id_critical ON public.franchisee_restaurants(base_restaurant_id);

-- 5. Asegurar que la FK más importante tenga índice
CREATE INDEX IF NOT EXISTS idx_franchisees_user_id_critical ON public.franchisees(user_id);

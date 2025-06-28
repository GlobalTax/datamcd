
-- Eliminar el índice duplicado, manteniendo solo uno
DROP INDEX IF EXISTS idx_franchisees_user_id_critical;

-- El índice original idx_franchisees_user_id ya existe y es suficiente

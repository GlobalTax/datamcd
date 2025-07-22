
-- Extender la tabla integration_configs para soportar más tipos de integración
ALTER TABLE integration_configs 
ADD COLUMN IF NOT EXISTS encrypted_credentials TEXT,
ADD COLUMN IF NOT EXISTS credential_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_key_rotation TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS access_log JSONB DEFAULT '[]'::jsonb;

-- Crear tabla para configuraciones de delivery
CREATE TABLE IF NOT EXISTS delivery_integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchisee_id UUID REFERENCES franchisees(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL, -- 'ubereats', 'deliveroo', 'glovo', 'justeat'
  provider_name TEXT NOT NULL,
  api_key_encrypted TEXT,
  merchant_id_encrypted TEXT,
  webhook_url_encrypted TEXT,
  is_enabled BOOLEAN DEFAULT false,
  credential_version INTEGER DEFAULT 1,
  last_key_rotation TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(franchisee_id, provider_id)
);

-- Crear tabla para configuraciones de POS
CREATE TABLE IF NOT EXISTS pos_integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchisee_id UUID REFERENCES franchisees(id) ON DELETE CASCADE,
  pos_system TEXT NOT NULL, -- 'micros', 'aloha', 'toast', etc.
  pos_name TEXT NOT NULL,
  endpoint_encrypted TEXT,
  api_key_encrypted TEXT,
  username_encrypted TEXT,
  password_encrypted TEXT,
  store_id_encrypted TEXT,
  is_enabled BOOLEAN DEFAULT false,
  credential_version INTEGER DEFAULT 1,
  last_key_rotation TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(franchisee_id, pos_system)
);

-- Crear tabla para configuraciones de contabilidad
CREATE TABLE IF NOT EXISTS accounting_integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchisee_id UUID REFERENCES franchisees(id) ON DELETE CASCADE,
  accounting_system TEXT NOT NULL, -- 'quantum', 'sage', 'contaplus', etc.
  system_name TEXT NOT NULL,
  server_encrypted TEXT,
  database_encrypted TEXT,
  username_encrypted TEXT,
  password_encrypted TEXT,
  api_key_encrypted TEXT,
  company_id_encrypted TEXT,
  sync_options JSONB DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN DEFAULT false,
  credential_version INTEGER DEFAULT 1,
  last_key_rotation TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(franchisee_id, accounting_system)
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE delivery_integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_integration_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para delivery_integration_configs
CREATE POLICY "Franchisees can manage their delivery configs" 
  ON delivery_integration_configs 
  FOR ALL 
  USING (
    (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) OR
    (franchisee_id IN (SELECT id FROM franchisees WHERE user_id = auth.uid()))
  )
  WITH CHECK (
    (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) OR
    (franchisee_id IN (SELECT id FROM franchisees WHERE user_id = auth.uid()))
  );

-- Políticas RLS para pos_integration_configs
CREATE POLICY "Franchisees can manage their POS configs" 
  ON pos_integration_configs 
  FOR ALL 
  USING (
    (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) OR
    (franchisee_id IN (SELECT id FROM franchisees WHERE user_id = auth.uid()))
  )
  WITH CHECK (
    (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) OR
    (franchisee_id IN (SELECT id FROM franchisees WHERE user_id = auth.uid()))
  );

-- Políticas RLS para accounting_integration_configs
CREATE POLICY "Franchisees can manage their accounting configs" 
  ON accounting_integration_configs 
  FOR ALL 
  USING (
    (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) OR
    (franchisee_id IN (SELECT id FROM franchisees WHERE user_id = auth.uid()))
  )
  WITH CHECK (
    (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text])) OR
    (franchisee_id IN (SELECT id FROM franchisees WHERE user_id = auth.uid()))
  );

-- Función para limpiar datos sensibles del localStorage (se ejecutará en el cliente)
CREATE OR REPLACE FUNCTION cleanup_local_storage_data()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta función será llamada desde el frontend para marcar la limpieza como completada
  INSERT INTO audit_logs (
    user_id,
    action_type,
    table_name,
    record_id,
    new_values
  ) VALUES (
    auth.uid(),
    'SECURITY_CLEANUP',
    'localStorage',
    'cleanup_sensitive_data',
    jsonb_build_object(
      'action', 'localStorage_cleanup_completed',
      'timestamp', now(),
      'user_agent', 'system'
    )
  );
  
  RETURN 'LocalStorage cleanup logged successfully';
END;
$$;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_delivery_configs_franchisee ON delivery_integration_configs(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_pos_configs_franchisee ON pos_integration_configs(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_accounting_configs_franchisee ON accounting_integration_configs(franchisee_id);
CREATE INDEX IF NOT EXISTS idx_delivery_configs_provider ON delivery_integration_configs(provider_id);
CREATE INDEX IF NOT EXISTS idx_pos_configs_system ON pos_integration_configs(pos_system);
CREATE INDEX IF NOT EXISTS idx_accounting_configs_system ON accounting_integration_configs(accounting_system);

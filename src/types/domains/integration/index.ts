// === DOMINIO: INTEGRACIONES ===
// Tipos relacionados con integraciones externas y APIs

// Configuraciones de integración
export interface IntegrationConfig {
  id: string;
  advisor_id: string;
  franchisee_id?: string;
  integration_type: string;
  config_name: string;
  api_endpoint?: string;
  api_key_encrypted?: string;
  encrypted_credentials?: string;
  configuration: any;
  is_active: boolean;
  last_sync?: string;
  credential_version?: number;
  last_key_rotation?: string;
  access_log?: any[];
  created_at: string;
  updated_at: string;
}

// Orquest Integration
export interface OrquestService {
  id: string;
  nombre: string | null;
  latitud: number | null;
  longitud: number | null;
  zona_horaria: string | null;
  datos_completos: any | null;
  updated_at: string | null;
}

export interface OrquestConfig {
  api_key: string;
  base_url: string;
  enabled: boolean;
}

export interface OrquestSyncResponse {
  success: boolean;
  services_updated: number;
  employees_updated?: number;
  last_sync: string;
  error?: string;
}

export interface OrquestWebhookPayload {
  event_type: 'service_updated' | 'service_created' | 'service_deleted';
  service_id: string;
  data: OrquestService;
  timestamp: string;
}

export interface OrquestMeasure {
  id: string;
  service_id: string;
  measure_type: string;
  value: number;
  from_time: string;
  to_time: string;
  measure_category: 'real' | 'forecast' | 'projection';
  business_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrquestMeasureType {
  id: string;
  measure_type: string;
  display_name: string;
  description: string | null;
  unit: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OrquestMeasurePayload {
  value: number;
  from: string;
  to: string;
  measure: string;
}

export interface OrquestMeasuresSyncResponse {
  success: boolean;
  measures_updated: number;
  measures_sent: number;
  last_sync: string;
  error?: string;
}

export interface OrquestMeasuresQueryParams {
  service_id: string;
  from_date: string;
  to_date: string;
  measure_types?: string[];
  category?: 'real' | 'forecast' | 'projection';
}

// Biloop Integration
export interface BiloopConfig {
  api_key: string;
  base_url: string;
  company_id: string;
  enabled: boolean;
}

export interface BiloopCompany {
  id: string;
  biloop_company_id: string;
  company_name: string;
  franchisee_id: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Accounting Integration
export interface AccountingIntegrationConfig {
  id: string;
  franchisee_id?: string;
  accounting_system: string;
  system_name: string;
  api_key_encrypted?: string;
  server_encrypted?: string;
  database_encrypted?: string;
  username_encrypted?: string;
  password_encrypted?: string;
  company_id_encrypted?: string;
  sync_options?: any;
  is_enabled: boolean;
  credential_version?: number;
  last_key_rotation?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Delivery Integration
export interface DeliveryIntegrationConfig {
  id: string;
  franchisee_id?: string;
  provider_name: string;
  provider_id: string;
  api_key_encrypted?: string;
  merchant_id_encrypted?: string;
  webhook_url_encrypted?: string;
  is_enabled: boolean;
  credential_version?: number;
  last_key_rotation?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Quantum Integration
export interface QuantumConfig {
  api_key: string;
  base_url: string;
  tenant_id: string;
  enabled: boolean;
}

export interface QuantumSyncStatus {
  last_sync: string;
  status: 'success' | 'error' | 'pending';
  records_synced: number;
  error_message?: string;
}

// Tipos de respuesta comunes
export interface SyncResponse {
  success: boolean;
  records_updated: number;
  last_sync: string;
  error?: string;
  details?: any;
}

export interface WebhookPayload {
  event_type: string;
  entity_id: string;
  entity_type: string;
  data: any;
  timestamp: string;
  source: string;
}

// Props para componentes
export interface OrquestDashboardProps {
  franchiseeId?: string;
  showGlobalConfig?: boolean;
}

export interface OrquestConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config?: OrquestConfig;
  onSave: (config: OrquestConfig) => Promise<void>;
}

export interface FranchiseeIntegrationConfigProps {
  franchiseeId: string;
  integrationType: string;
  onConfigSaved?: () => void;
}

export interface QuantumDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  onDataSynced?: () => void;
}

// Employee mapping para Orquest
export interface OrquestEmployeeMapping {
  id: string;
  orquest_employee_id?: string;
  local_employee_id?: string;
  service_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrquestEmployeeMetrics {
  id: string;
  franchisee_id?: string;
  service_id?: string;
  año: number;
  mes: number;
  total_empleados?: number;
  total_horas_netas?: number;
  total_horas_nocturnas?: number;
  total_turnos_cierre?: number;
  total_ausencias?: number;
  tasa_ausentismo?: number;
  promedio_asistencia?: number;
  created_at?: string;
  updated_at?: string;
}

// Tipos de configuración de integraciones
export interface IntegrationProvider {
  id: string;
  name: string;
  type: 'accounting' | 'payroll' | 'pos' | 'delivery' | 'workforce' | 'other';
  description: string;
  logo_url?: string;
  auth_type: 'api_key' | 'oauth2' | 'username_password' | 'certificate';
  required_fields: IntegrationField[];
  optional_fields: IntegrationField[];
  webhook_support: boolean;
  sync_frequency: string[];
  is_active: boolean;
}

export interface IntegrationField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select' | 'boolean' | 'file';
  required: boolean;
  encrypted: boolean;
  placeholder?: string;
  options?: string[];
  validation?: string;
}
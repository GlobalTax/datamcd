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

// Nuevos tipos para medidas
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
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
  last_sync: string;
  error?: string;
}

export interface OrquestWebhookPayload {
  event_type: 'service_updated' | 'service_created' | 'service_deleted';
  service_id: string;
  data: OrquestService;
  timestamp: string;
}
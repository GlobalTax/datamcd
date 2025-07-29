// Nuevos tipos para el sistema de incidencias 360°

export type IncidentType = 'general' | 'equipment' | 'staff' | 'customer' | 'safety' | 'hygiene' | 
  'climatizacion' | 'electricidad' | 'fontaneria' | 'mantenimiento' | 'equipamiento' | 
  'obras' | 'limpieza' | 'seguridad' | 'varios';

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending' | 'cancelled';

export type IncidentSource = 'manual' | 'voice' | 'automatic' | 'api' | 'excel';

// Nueva estructura de incidentes siguiendo el esquema propuesto
export interface Incident {
  id: string;
  title: string;
  description?: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  source: IncidentSource;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  restaurant_id: string;
  provider_id?: string;
  reported_by?: string;
  assigned_to?: string;
  estimated_resolution?: string;
  resolution_notes?: string;
  // Campos del Excel (compatibilidad)
  nombre?: string;
  naves?: string;
  ingeniero?: string;
  clasificacion?: string;
  participante?: string;
  periodo?: string;
  importe_carto?: number;
  documento_url?: string;
  fecha_cierre?: string;
  comentarios_cierre?: string;
}

export interface CreateIncidentData {
  title: string;
  description?: string;
  type: IncidentType;
  priority: IncidentPriority;
  restaurant_id: string;
  provider_id?: string;
  assigned_to?: string;
  estimated_resolution?: string;
  source?: IncidentSource;
  // Campos del Excel
  nombre?: string;
  naves?: string;
  ingeniero?: string;
  clasificacion?: string;
  participante?: string;
  periodo?: string;
  importe_carto?: number;
  documento_url?: string;
}

export interface UpdateIncidentData {
  title?: string;
  description?: string;
  type?: IncidentType;
  priority?: IncidentPriority;
  status?: IncidentStatus;
  provider_id?: string;
  assigned_to?: string;
  resolution_notes?: string;
  estimated_resolution?: string;
  resolved_at?: string;
  // Campos del Excel
  nombre?: string;
  naves?: string;
  ingeniero?: string;
  clasificacion?: string;
  participante?: string;
  periodo?: string;
  importe_carto?: number;
  documento_url?: string;
  fecha_cierre?: string;
  comentarios_cierre?: string;
}

// Proveedores
export interface Provider {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  tax_id?: string;
  provider_type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateProviderData {
  name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  tax_id?: string;
  provider_type?: string;
  is_active?: boolean;
}

// Métricas
export type MetricCategory = 'performance' | 'cost' | 'quality' | 'volume';
export type MetricUnit = 'hours' | 'days' | 'euros' | 'count' | 'percentage';

export interface MetricDefinition {
  id: string;
  code: string;
  label: string;
  description?: string;
  calc_sql?: string;
  unit?: MetricUnit;
  category?: MetricCategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MetricSnapshot {
  id: string;
  metric_id: string;
  value: number;
  period_start?: string;
  period_end?: string;
  snapshot_date: string;
  restaurant_id?: string;
  metadata?: any;
  created_at: string;
  metric?: MetricDefinition;
}

// Reportes
export type ReportType = 'incidents' | 'metrics' | 'combined';

export interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  report_type: ReportType;
  config: any; // Configuración del reporte (columnas, filtros, etc.)
  schedule_cron?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportSnapshot {
  id: string;
  report_id: string;
  generated_at: string;
  file_url?: string;
  file_size?: number;
  status: 'generated' | 'sent' | 'error';
  recipients?: string[];
  error_message?: string;
  metadata?: any;
}

// Notas de voz
export interface VoiceNote {
  id: string;
  user_id: string;
  file_url: string;
  file_size?: number;
  duration_seconds?: number;
  language: string;
  quality: 'low' | 'standard' | 'high';
  created_at: string;
}

export interface VoiceTranscript {
  id: string;
  voice_note_id: string;
  transcript?: string;
  ai_summary?: string;
  confidence_score?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
  processed_at?: string;
  created_at: string;
}

export interface VoiceEntityLink {
  id: string;
  voice_note_id: string;
  entity_type: 'incident' | 'restaurant' | 'provider';
  entity_id: string;
  relationship_type: 'created' | 'updated' | 'related';
  confidence_score?: number;
  created_by_ai: boolean;
  created_at: string;
}

// Tipos compuestos para la UI
export interface IncidentWithRelations extends Incident {
  restaurant?: {
    id: string;
    name: string;
    site_number: string;
  };
  provider?: Provider;
  reported_user?: {
    full_name: string;
  };
  assigned_user?: {
    full_name: string;
  };
  voice_links?: VoiceEntityLink[];
}

export interface MetricDashboardData {
  mttr: MetricSnapshot;
  mtta: MetricSnapshot;
  totalIncidents: MetricSnapshot;
  criticalIncidents: MetricSnapshot;
  capexTotal: MetricSnapshot;
  trends: {
    daily: MetricSnapshot[];
    weekly: MetricSnapshot[];
    monthly: MetricSnapshot[];
  };
}

// Filtros para la nueva API
export interface IncidentFilters {
  status?: IncidentStatus[];
  priority?: IncidentPriority[];
  type?: IncidentType[];
  restaurant_id?: string[];
  provider_id?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
  assigned_to?: string[];
  source?: IncidentSource[];
}
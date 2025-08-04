export type IncidentType = 'general' | 'equipment' | 'staff' | 'customer' | 'safety' | 'hygiene' | 
  'climatizacion' | 'electricidad' | 'fontaneria' | 'mantenimiento' | 'equipamiento' | 
  'obras' | 'limpieza' | 'seguridad' | 'varios';

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending' | 'cancelled';

export interface RestaurantIncident {
  id: string;
  title: string;
  description?: string;
  incident_type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  restaurant_id: string;
  reported_by: string;
  assigned_to?: string;
  resolution_notes?: string;
  estimated_resolution?: string; // Fecha como string ISO
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  // Nuevos campos del Excel
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
  // Nuevos campos agregados
  numero_secuencial?: number;
  numero_pedido?: string;
  comentarios_historial?: Array<{
    fecha: string;
    comentario: string;
    usuario_id?: string;
  }>;
}

export interface IncidentComment {
  id: string;
  incident_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface CreateIncidentData {
  title: string;
  description?: string;
  incident_type: IncidentType;
  priority: IncidentPriority;
  restaurant_id: string;
  assigned_to?: string;
  estimated_resolution?: string;
  // Nuevos campos del Excel
  nombre?: string;
  naves?: string;
  ingeniero?: string;
  clasificacion?: string;
  participante?: string;
  periodo?: string;
  importe_carto?: number;
  documento_url?: string;
  numero_pedido?: string;
}

export interface UpdateIncidentData {
  title?: string;
  description?: string;
  incident_type?: IncidentType;
  priority?: IncidentPriority;
  status?: IncidentStatus;
  assigned_to?: string;
  resolution_notes?: string;
  estimated_resolution?: string;
  // Nuevos campos del Excel
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
  numero_pedido?: string;
}
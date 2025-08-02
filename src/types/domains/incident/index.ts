// === DOMINIO: INCIDENCIAS ===
// Tipos relacionados con incidencias, gestión y resolución

export interface Incident {
  id: string;
  restaurant_id?: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  estimated_resolution?: string;
  resolved_at?: string;
  resolution_notes?: string;
  reported_by?: string;
  assigned_to?: string;
  provider_id?: string;
  source?: string;
  
  // Campos específicos del sistema legacy
  nombre?: string;
  naves?: string;
  ingeniero?: string;
  clasificacion?: string;
  participante?: string;
  periodo?: string;
  documento_url?: string;
  importe_carto?: number;
  fecha_cierre?: string;
  comentarios_cierre?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface NewIncident {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  estimated_cost?: number;
  estimated_hours?: number;
  due_date?: string;
  assigned_to?: string;
  provider_id?: string;
  attachments?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface IncidentComment {
  id: string;
  incident_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

// Tipos de filtros
export interface IncidentFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  category?: string[];
  assignedTo?: string[];
  createdBy?: string[];
  restaurant?: string[];
  provider?: string[];
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  estimatedCostRange?: {
    min?: number;
    max?: number;
  };
}

export interface AdvancedIncidentFilters extends IncidentFilters {
  // Búsqueda expandida
  restaurantName?: string;
  providerName?: string;
  searchFields?: ('title' | 'description' | 'resolution_notes')[];
  
  // Filtros de fecha extendidos
  datePreset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  
  // Metadatos del filtro
  filterName?: string;
  isSaved?: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: AdvancedIncidentFilters;
  createdAt: Date;
  isDefault?: boolean;
}

export interface QuickFilterOption {
  id: string;
  label: string;
  filters: Partial<AdvancedIncidentFilters>;
  variant?: 'default' | 'outline' | 'secondary';
}

// Métricas y estadísticas
export interface IncidentMetrics {
  totalIncidents: number;
  openIncidents: number;
  inProgressIncidents: number;
  resolvedIncidents: number;
  criticalIncidents: number;
  averageResolutionTime: number;
  totalEstimatedCost: number;
  incidentsByCategory: Record<string, number>;
  incidentsByPriority: Record<string, number>;
  incidentsByStatus: Record<string, number>;
  monthlyTrends: {
    month: string;
    incidents: number;
    resolved: number;
    avgResolutionTime: number;
  }[];
}

// Props para componentes
export interface IncidentDialogProps {
  incident?: Incident;
  isOpen: boolean;
  onClose: () => void;
  onSave: (incident: Partial<Incident>) => Promise<void>;
  restaurantId?: string;
}

export interface NewIncidentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (incident: Partial<NewIncident>) => Promise<void>;
  restaurantId?: string;
}

export interface IncidentDetailDialogProps {
  incident: NewIncident;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (incident: Partial<NewIncident>) => Promise<void>;
  onAddComment: (comment: string, isInternal: boolean) => Promise<void>;
}

export interface IncidentsTableProps {
  incidents: NewIncident[];
  loading?: boolean;
  onIncidentClick?: (incident: NewIncident) => void;
  onStatusChange?: (incidentId: string, status: string) => Promise<void>;
  showActions?: boolean;
}

export interface IncidentFiltersProps {
  filters: IncidentFilters;
  onFiltersChange: (filters: IncidentFilters) => void;
  onReset: () => void;
}

export interface AdvancedIncidentFiltersProps {
  filters: AdvancedIncidentFilters;
  onFiltersChange: (filters: AdvancedIncidentFilters) => void;
  onSavePreset?: (name: string, filters: AdvancedIncidentFilters) => void;
  onLoadPreset?: (preset: FilterPreset) => void;
  presets?: FilterPreset[];
}

export interface MetricsDashboardProps {
  metrics: IncidentMetrics;
  period: {
    from: string;
    to: string;
  };
  onPeriodChange: (period: { from: string; to: string }) => void;
}

// Tipos de configuración
export interface IncidentCategory {
  id: string;
  name: string;
  description?: string;
  subcategories: IncidentSubcategory[];
  color?: string;
  icon?: string;
}

export interface IncidentSubcategory {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  estimated_hours?: number;
  estimated_cost?: number;
}

export interface IncidentProvider {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  specialties: string[];
  is_active: boolean;
  rating?: number;
  notes?: string;
}

// Constantes
export const QUICK_FILTER_OPTIONS: QuickFilterOption[] = [
  {
    id: 'open',
    label: 'Abiertas',
    filters: { status: ['open'] },
    variant: 'default'
  },
  {
    id: 'in_progress',
    label: 'En progreso',
    filters: { status: ['in_progress'] },
    variant: 'outline'
  },
  {
    id: 'resolved',
    label: 'Resueltas',
    filters: { status: ['resolved'] },
    variant: 'secondary'
  },
  {
    id: 'critical',
    label: 'Críticas',
    filters: { priority: ['critical'] },
    variant: 'outline'
  },
  {
    id: 'this_week',
    label: 'Esta semana',
    filters: { datePreset: 'week' },
    variant: 'outline'
  }
];

export const DATE_PRESETS = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'quarter', label: 'Este trimestre' },
  { id: 'year', label: 'Este año' },
  { id: 'custom', label: 'Personalizado' }
] as const;
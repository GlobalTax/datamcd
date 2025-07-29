import type { IncidentFilters } from './newIncident';

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
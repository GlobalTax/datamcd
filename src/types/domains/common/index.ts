// === DOMINIO: COMUNES ===
// Tipos compartidos y de infraestructura

// Sistema de logging
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  restaurantId?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  error?: Error;
}

// Respuestas de servicios
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends ServiceResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// Estado de conexión
export interface ConnectionStatusContextType {
  isOnline: boolean;
  isReconnecting: boolean;
  lastConnected?: Date;
  retryCount: number;
  maxRetries: number;
  retryDelay: number;
}

export interface ConnectionStatusProviderProps {
  children: React.ReactNode;
  checkInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
}

// Error Boundary
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Loading states
export interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Rutas protegidas
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  requireAuth?: boolean;
}

// Tipos de datos estáticos
export interface RestaurantData {
  id: string;
  base_restaurant: {
    id: string;
    restaurant_name: string;
    site_number: string;
    address: string;
    city: string;
    state: string;
    country: string;
    restaurant_type: 'traditional' | 'drive_thru' | 'express' | 'mccafe';
    opening_date: string;
    square_meters: number;
    seating_capacity: number;
  };
  status: 'active' | 'inactive' | 'pending' | 'closed';
  last_year_revenue: number;
  monthly_rent: number;
  franchise_start_date: string;
  franchise_end_date: string;
}

// Tipos de contactos
export type ContactType = 'ingeniero' | 'arquitecto' | 'proveedor' | 'tecnico' | 'constructor' | 'otro';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  contact_type: ContactType;
  specialization?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateContactData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  contact_type: ContactType;
  specialization?: string;
  address?: string;
  notes?: string;
}

export interface UpdateContactData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  contact_type?: ContactType;
  specialization?: string;
  address?: string;
  notes?: string;
  is_active?: boolean;
}

// Props comunes para componentes
export interface ContactDialogProps {
  contact?: Contact;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: CreateContactData | UpdateContactData) => Promise<void>;
}

export interface ContactsTableProps {
  contacts: Contact[];
  loading?: boolean;
  onContactClick?: (contact: Contact) => void;
}

// Datos de importación
export interface DataImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  onImportComplete?: (results: ImportResults) => void;
}

export interface ImportResults {
  success: boolean;
  total: number;
  imported: number;
  errors: string[];
  warnings: string[];
}

// Auditoría
export interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Métricas generales
export interface MetricDefinition {
  id: string;
  code: string;
  label: string;
  description?: string;
  unit?: string;
  category?: string;
  calc_sql?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MetricSnapshot {
  id: string;
  metric_id?: string;
  restaurant_id?: string;
  value: number;
  snapshot_date?: string;
  period_start?: string;
  period_end?: string;
  metadata?: any;
  created_at?: string;
}

// Configuración de notificaciones
export interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    [key: string]: {
      enabled: boolean;
      priority: 'low' | 'medium' | 'high';
    };
  };
}

// Tipos de paginación
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filtros base
export interface BaseFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  createdBy?: string[];
}

// Tipos de selección
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Tipos de archivos
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

// Configuración de tablas
export interface TableColumn {
  id: string;
  label: string;
  sortable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableConfig {
  columns: TableColumn[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  selection?: 'single' | 'multiple' | 'none';
  actions?: boolean;
}

// Estados de formularios
export interface FormState<T> {
  data: T;
  loading: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isValid: boolean;
}

// Configuración de exportación
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename?: string;
  includeHeaders: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: Record<string, any>;
  columns?: string[];
}
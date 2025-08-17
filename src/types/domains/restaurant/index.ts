// Re-export tipos RBAC
export type {
  RestaurantRole,
  AdvisorAccessLevel,
  RestaurantMember,
  AdvisorRestaurant,
  RestaurantMembersManagerProps,
  RestaurantAccessControlProps,
  AddMemberDialogProps,
  RestaurantRoleSelectProps,
  RestaurantMembersFilters,
  RestaurantAccessCheck
} from './rbac';

// Tipos base para compatibilidad
export interface Franchisee {
  id: string;
  user_id?: string;
  franchisee_name: string;
  company_name?: string;
  tax_id?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  email?: string;
  biloop_company_id?: string;
  created_at: string;
  updated_at: string;
  total_restaurants?: number;
}

export interface Restaurant {
  id: string;
  franchisee_id: string;
  site_number: string;
  restaurant_name: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  opening_date?: string;
  restaurant_type: 'traditional' | 'mccafe' | 'drive_thru' | 'express';
  status: 'active' | 'inactive' | 'pending' | 'closed';
  square_meters?: number;
  seating_capacity?: number;
  created_at: string;
  updated_at: string;
}

export interface BaseRestaurant {
  id: string;
  site_number: string;
  restaurant_name: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  opening_date?: string;
  restaurant_type: 'traditional' | 'mccafe' | 'drive_thru' | 'express';
  square_meters?: number;
  seating_capacity?: number;
  franchisee_name?: string;
  franchisee_email?: string;
  company_tax_id?: string;
  autonomous_community?: string;
  property_type?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface FranchiseeRestaurant {
  id: string;
  franchisee_id: string;
  base_restaurant_id?: string;
  franchise_start_date?: string;
  franchise_end_date?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  monthly_rent?: number;
  franchise_fee_percentage?: number;
  advertising_fee_percentage?: number;
  last_year_revenue?: number;
  average_monthly_sales?: number;
  status: 'active' | 'inactive' | 'pending' | 'closed' | 'assigned';
  assigned_at: string;
  updated_at: string;
  notes?: string;
}

// NUEVO: Tipo para la vista unificada unified_restaurants
export interface UnifiedRestaurant {
  id: string; // franchisee_restaurant.id (principal)
  base_restaurant_id: string;
  site_number: string;
  restaurant_name: string;
  address: string;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  restaurant_type: string;
  opening_date: string | null;
  square_meters: number | null;
  seating_capacity: number | null;
  autonomous_community: string | null;
  property_type: string | null;
  status: string;
  franchisee_id: string;
  franchise_start_date: string | null;
  franchise_end_date: string | null;
  lease_start_date: string | null;
  lease_end_date: string | null;
  monthly_rent: number | null;
  franchise_fee_percentage: number | null;
  advertising_fee_percentage: number | null;
  last_year_revenue: number | null;
  average_monthly_sales: number | null;
  notes: string | null;
  franchisee_name: string;
  company_name: string | null;
  tax_id: string | null;
  franchisee_city: string | null;
  franchisee_country: string | null;
  base_created_at: string;
  assigned_at: string;
  updated_at: string;
  status_display: string;
  is_assigned: boolean;
}

// Tipos unificados para vistas complejas (LEGACY - usar UnifiedRestaurant)
export interface UnifiedRestaurantLegacy {
  id: string;
  base_restaurant: BaseRestaurant;
  isAssigned: boolean;
  assignment?: FranchiseeRestaurant;
  franchisee?: {
    id: string;
    franchisee_name: string;
    company_name?: string;
  };
  status: string;
  lastActivity?: string;
  kpis?: {
    revenue?: number;
    profitMargin?: number;
    customerSatisfaction?: number;
  };
}

// Tipos de filtros
export interface BaseRestaurantFilters {
  search?: string;
  restaurantType?: string[];
  autonomousCommunity?: string[];
  propertyType?: string[];
  isAssigned?: boolean;
  sortBy?: 'name' | 'site_number' | 'city' | 'opening_date';
  sortOrder?: 'asc' | 'desc';
}

export interface RestaurantFilters {
  status?: string;
  type?: string;
  franchisee?: string;
}

// NUEVO: Filtros para vista unificada
export interface UnifiedRestaurantsFilters {
  search?: string;
  status?: string;
  restaurant_type?: string;
  autonomous_community?: string;
  franchisee_id?: string;
}

// Tipos de asignaciones
export interface RestaurantAssignment {
  id: string;
  base_restaurant_id: string;
  franchisee_id: string;
  assigned_at: string;
  status: 'pending' | 'active' | 'inactive';
  notes?: string;
}

// Tipos de métricas
export interface RestaurantMetrics {
  totalRevenue: number;
  avgMonthlyRevenue: number;
  profitMargin: number;
  lastUpdated: string;
}

export interface RestaurantValuationSummary {
  id: string;
  restaurantId: string;
  valuationDate: string;
  initialSales: number;
  currentValuation: number;
  projectedYears: number;
}

export interface ValuationFormData {
  valuationDate: string;
  initialSales: number;
  salesGrowthRate: number;
  inflationRate: number;
  discountRate: number;
  yearsRemaining: number;
  pacPercentage: number;
  rentPercentage: number;
  serviceFeesPercentage: number;
  depreciation: number;
  interest: number;
  loanPayment: number;
  rentIndex: number;
  miscellaneous: number;
}

// Tipos de props para componentes
export interface BaseRestaurantFiltersProps {
  filters: BaseRestaurantFilters;
  onFiltersChange: (filters: BaseRestaurantFilters) => void;
  onReset: () => void;
}

export interface RestaurantDataManagerProps {
  restaurantId: string;
  onDataUpdate?: () => void;
}

export interface RestaurantManagerProps {
  onRestaurantCreated?: (restaurant: BaseRestaurant) => void;
}

export interface RestaurantAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId?: string;
  onAssignmentComplete?: () => void;
}

// Configuración de columnas para tablas
export interface ColumnSettings {
  [key: string]: {
    visible: boolean;
    width?: number;
    order: number;
  };
}

export interface BaseRestaurantsTableProps {
  onRestaurantSelect?: (restaurant: BaseRestaurant) => void;
  showAssignmentControls?: boolean;
  selectionMode?: 'single' | 'multiple' | 'none';
}

export interface UnifiedRestaurantsTableProps {
  restaurants: UnifiedRestaurant[];
  loading?: boolean;
  onRestaurantClick?: (restaurant: UnifiedRestaurant) => void;
  showFilters?: boolean;
  showActions?: boolean;
}

export interface FranchiseeRestaurantsTableProps {
  franchiseeId: string;
  showActions?: boolean;
  onRestaurantClick?: (restaurant: FranchiseeRestaurant) => void;
}

// NUEVO: Props para componentes que usan el modelo unificado
export interface RestaurantHubProps {
  restaurantId: string;
}

export interface UnifiedRestaurantCardProps {
  restaurant: UnifiedRestaurant;
  onClick?: (restaurant: UnifiedRestaurant) => void;
  showActions?: boolean;
}

// NUEVO: Tipos para funciones auxiliares
export interface UserRestaurant {
  restaurant_id: string;
  franchisee_id: string;
  restaurant_name: string;
  site_number: string;
}
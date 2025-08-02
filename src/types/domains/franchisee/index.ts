// === DOMINIO: FRANQUICIADOS ===
// Tipos relacionados con franquiciados y su gestión

export interface Franchisee {
  id: string;
  user_id: string;
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
  hasAccount?: boolean;
  isOnline?: boolean;
  lastAccess?: string;
  profiles?: {
    email: string;
    full_name?: string;
    phone?: string;
  };
}

export interface FranchiseeStaff {
  id: string;
  user_id: string;
  franchisee_id: string;
  position?: string;
  permissions?: any;
  created_at: string;
  updated_at: string;
}

export interface FranchiseeInvitation {
  id: string;
  franchisee_id: string;
  email: string;
  invited_by: string;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'expired';
  invited_at: string;
  accepted_at?: string;
  expires_at: string;
}

export interface FranchiseeAccessLog {
  id: string;
  franchisee_id: string;
  user_id?: string;
  login_time: string;
  logout_time?: string;
  ip_address?: string;
  user_agent?: string;
  session_duration?: number;
}

export interface FranchiseeActivityLog {
  id: string;
  franchisee_id: string;
  user_id?: string;
  activity_type: string;
  activity_description?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: any;
  created_at: string;
}

// Tipos de filtros
export interface FranchiseeFilters {
  search?: string;
  hasAccount?: boolean;
  isOnline?: boolean;
  totalRestaurants?: {
    min?: number;
    max?: number;
  };
  lastAccess?: {
    from?: string;
    to?: string;
  };
}

// Tipos de props para componentes
export interface FranchiseeCardProps {
  franchisee: Franchisee;
  onEdit?: (franchisee: Franchisee) => void;
  onDelete?: (franchiseeId: string) => void;
  onViewDetails?: (franchisee: Franchisee) => void;
}

export interface FranchiseeFiltersProps {
  filters: FranchiseeFilters;
  onFiltersChange: (filters: FranchiseeFilters) => void;
  onReset: () => void;
}

export interface FranchiseeSelectorProps {
  selectedFranchiseeId?: string;
  onFranchiseeChange: (franchiseeId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
// === TIPOS RBAC POR RESTAURANTE ===

export type RestaurantRole = 'owner' | 'manager' | 'staff' | 'viewer';
export type AdvisorAccessLevel = 'read' | 'write' | 'full';

export interface RestaurantMember {
  id: string;
  user_id: string;
  restaurant_id: string;
  role: RestaurantRole;
  assigned_at: string;
  assigned_by?: string;
  is_active: boolean;
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Datos relacionados del usuario
  user?: {
    id: string;
    email: string;
    full_name?: string;
    role: string;
  };
}

export interface AdvisorRestaurant {
  id: string;
  advisor_user_id: string;
  restaurant_id: string;
  assigned_at: string;
  assigned_by?: string;
  is_active: boolean;
  access_level: AdvisorAccessLevel;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  advisor?: {
    id: string;
    email: string;
    full_name?: string;
  };
  restaurant?: {
    id: string;
    restaurant_name: string;
    site_number: string;
  };
}

// Props para componentes
export interface RestaurantMembersManagerProps {
  restaurantId: string;
  showHeader?: boolean;
  readOnly?: boolean;
}

export interface RestaurantAccessControlProps {
  restaurantId: string;
  requiredRole?: RestaurantRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface AddMemberDialogProps {
  restaurantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberAdded?: () => void;
}

export interface RestaurantRoleSelectProps {
  value: RestaurantRole;
  onValueChange: (role: RestaurantRole) => void;
  disabled?: boolean;
  currentUserRole?: RestaurantRole;
}

// Filtros y consultas
export interface RestaurantMembersFilters {
  role?: RestaurantRole;
  is_active?: boolean;
  search?: string;
}

export interface RestaurantAccessCheck {
  hasAccess: boolean;
  userRole: RestaurantRole | null;
  isLoading: boolean;
}
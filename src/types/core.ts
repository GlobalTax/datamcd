// Tipos centralizados del dominio de negocio

// === TIPOS DE AUTENTICACIÓN ===
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'franchisee' | 'admin' | 'superadmin' | 'staff' | 'asesor';
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  session?: any;
  franchisee?: Franchisee | null;
  restaurants?: Restaurant[];
  loading: boolean;
  connectionStatus?: 'online' | 'offline' | 'reconnecting';
  effectiveFranchisee?: Franchisee | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  getDebugInfo?: () => any;
}

// === TIPOS DE FRANQUICIADOS ===
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

// === TIPOS DE RESTAURANTES ===
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
  status: 'active' | 'inactive' | 'pending' | 'closed';
  assigned_at: string;
  updated_at: string;
  notes?: string;
}

// === TIPOS DE EMPLEADOS ===
export interface Employee {
  id: string;
  restaurant_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  status: 'active' | 'inactive' | 'terminated';
  hire_date: string;
  contract_start_date: string;
  contract_end_date?: string;
  termination_date?: string;
  contract_type: string;
  hourly_rate?: number;
  base_salary?: number;
  weekly_hours?: number;
  salary_frequency?: string;
  schedule_type?: string;
  social_security_number?: string;
  bank_account?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  vacation_days_per_year?: number;
  vacation_days_used?: number;
  vacation_days_pending?: number;
  sick_days_used?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// === COMPATIBILIDAD ===
// Re-export para mantener compatibilidad con archivos existentes
export type { FranchiseeInvitation, FranchiseeAccessLog, FranchiseeActivityLog } from './franchiseeInvitation';
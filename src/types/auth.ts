
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'franchisee' | 'asesor' | 'admin' | 'superadmin' | 'manager' | 'asistente';
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

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

export interface AuthContextType {
  user: User | null;
  session?: any;
  franchisee?: Franchisee | null;
  restaurants?: Restaurant[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
}

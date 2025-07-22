// Types for the McDonald's Franchisee Management Portal

export interface AuthUser {
  id: string;
  email: string;
  role: 'franchisee' | 'advisor' | 'admin' | 'superadmin' | 'asesor';
  full_name?: string;
}

export interface Franchisee {
  id: string;
  user_id: string;
  franchisee_name: string;
  contact_person: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  franchisee_id: string;
  status: 'active' | 'inactive';
}

export interface ConnectionStatus {
  orquest: boolean;
  quantum: boolean;
  biloop: boolean;
  pos: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  franchisee: Franchisee | null;
  restaurants: Restaurant[];
  connectionStatus: ConnectionStatus;
  isImpersonating: boolean;
  impersonatedFranchisee: Franchisee | null;
  effectiveFranchisee: Franchisee | null;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  startImpersonation: (franchiseeId: string) => Promise<void>;
  stopImpersonation: () => void;
  getDebugInfo: () => any;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  endpoint: string;
}

export interface RateLimitEntry {
  ip: string;
  endpoint: string;
  requests: number;
  window_start: string;
  blocked_until?: string;
}
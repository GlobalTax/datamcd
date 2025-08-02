// === DOMINIO: AUTENTICACIÓN ===
// Tipos relacionados con usuarios, sesiones y autenticación

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
  franchisee?: any | null;
  restaurants?: any[];
  loading: boolean;
  connectionStatus?: 'online' | 'offline' | 'reconnecting';
  effectiveFranchisee?: any | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  getDebugInfo?: () => any;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Re-exports necesarios para dependencias
export type { Franchisee } from '../franchisee';
export type { Restaurant } from '../restaurant';
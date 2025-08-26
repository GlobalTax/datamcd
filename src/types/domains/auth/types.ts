// === AUTHENTICATION DOMAIN TYPES ===
// Core types for authentication, users, and sessions

import type { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'franchisee' | 'admin' | 'superadmin' | 'staff' | 'asesor';
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile extends User {
  must_change_password?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  connectionStatus: 'online' | 'offline' | 'reconnecting';
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

// Session and authentication state
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

// Password requirements
export interface PasswordValidation {
  valid: boolean;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}
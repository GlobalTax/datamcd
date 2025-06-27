
import { User, Franchisee } from '@/types/auth';

export interface AuthState {
  user: User | null;
  franchisee: Franchisee | null;
  restaurants: any[];
  loading: boolean;
  connectionStatus: 'connecting' | 'connected' | 'fallback';
  isUsingCache: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export interface UserDataResult {
  user: User;
  franchisee?: Franchisee;
  restaurants?: any[];
}

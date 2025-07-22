// Tipos unificados para el sistema de autenticación
export interface ConnectionStatus {
  status: 'online' | 'offline' | 'reconnecting';
  lastHeartbeat?: Date;
}

export interface UnifiedAuthContextType {
  user: any | null;
  franchisee?: any | null;
  restaurants?: any[];
  loading: boolean;
  connectionStatus?: ConnectionStatus;
  effectiveFranchisee?: any | null;
  isImpersonating?: boolean;
  impersonatedFranchisee?: any | null;
  startImpersonation?: (franchisee: any) => void;
  stopImpersonation?: () => void;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  signUp?: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  getDebugInfo?: () => any;
}
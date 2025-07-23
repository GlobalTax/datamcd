
import React from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';

// Crear un contexto compatible con el sistema anterior
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuthLegacy = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthLegacy must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();

  // Adaptar el nuevo hook al tipo legacy
  const value: AuthContextType = {
    user: auth.user,
    loading: auth.loading,
    signIn: async (email: string, password: string) => {
      const result = await auth.signIn(email, password);
      return { data: result.error ? null : auth.user, error: result.error };
    },
    signOut: async () => {
      await auth.signOut();
      return { error: null };
    },
    signUp: async (email: string, password: string, fullName: string) => {
      const result = await auth.signUp(email, password, fullName);
      return { data: result.error ? null : auth.user, error: result.error };
    },
    getDebugInfo: () => ({
      user: auth.user ? { id: auth.user.id, email: auth.user.email } : null,
      loading: auth.loading,
      timestamp: new Date().toISOString()
    }),
    // Campos adicionales para compatibilidad
    franchisee: null,
    restaurants: [],
    connectionStatus: 'online',
    effectiveFranchisee: null,
    isImpersonating: false,
    impersonatedFranchisee: null,
    startImpersonation: async () => {},
    stopImpersonation: () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export para mantener compatibilidad
export { useAuthLegacy as useAuth };

import { useAuth } from '@/hooks/useAuth';

type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

// Hook de compatibilidad temporal para migrar gradualmente desde useUnifiedAuth
export const useUnifiedAuth = () => {
  const auth = useAuth();
  
  return {
    ...auth,
    // Propiedades adicionales para compatibilidad (valores por defecto)
    franchisee: null,
    restaurants: [],
    connectionStatus: 'online' as ConnectionStatus,
    effectiveFranchisee: null,
    isImpersonating: false,
    impersonatedFranchisee: null,
    startImpersonation: async () => {},
    stopImpersonation: () => {},
    getDebugInfo: () => ({
      user: auth.user ? { id: auth.user.id, email: auth.user.email } : null,
      loading: auth.loading,
      timestamp: new Date().toISOString(),
      connectionStatus: 'online' as ConnectionStatus
    }),
  };
};
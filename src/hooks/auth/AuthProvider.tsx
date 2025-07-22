import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { AuthUser, AuthContextType } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { performSecurityAudit } from '@/utils/securityCleanup';
import { useSecureLogging } from '@/hooks/useSecureLogging';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  franchisee: null,
  restaurants: [],
  connectionStatus: 'online',
  effectiveFranchisee: null,
  isImpersonating: false,
  impersonatedFranchisee: null,
  startImpersonation: async () => {},
  stopImpersonation: () => {},
  signIn: async () => ({ data: null, error: null }),
  signOut: async () => ({ error: null }),
  signUp: async () => ({ data: null, error: null }),
  getDebugInfo: () => ({}),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Integrar logging seguro
  const { logInfo, logError, logSecurity, logUserAction } = useSecureLogging();

  const performSecurityAuditCheck = useCallback(async () => {
    try {
      logSecurity('Starting security audit for localStorage');
      
      // Realizar auditoría de seguridad
      const result = performSecurityAudit();
      
      if (result.cleanedKeys > 0) {
        logSecurity('Security cleanup completed', {
          cleanedKeysCount: result.cleanedKeys,
          success: result.success
        });
        
        // Notificar al usuario si se encontraron datos sensibles
        console.warn('⚠️ SECURITY: Se encontraron y eliminaron datos sensibles del almacenamiento local');
      } else {
        logInfo('Security audit completed - no sensitive data found');
      }
    } catch (error) {
      logError('Security audit failed', { error });
    }
  }, [logInfo, logError, logSecurity]);

  // Configurar listener de autenticación
  useEffect(() => {
    logInfo('Setting up authentication listener');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logUserAction(`Auth event: ${event}`, `hasSession: ${!!session}`);
        
        if (session?.user) {
          setUser(session.user as AuthUser);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user as AuthUser);
      }
      setLoading(false);
    });

    // Realizar auditoría de seguridad al inicializar
    performSecurityAuditCheck();

    return () => {
      subscription.unsubscribe();
    };
  }, [logInfo, logUserAction, performSecurityAuditCheck]);

  const signIn = async (email: string, password: string) => {
    try {
      logUserAction('Attempting sign in', `email: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logError('Sign in failed', { error: error.message, email });
        return { data: null, error };
      }

      logUserAction('Sign in successful', `userId: ${data.user?.id}`);
      return { data, error: null };
    } catch (error) {
      logError('Sign in exception', { error, email });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      logUserAction('Attempting sign out', `userId: ${user?.id}`);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logError('Sign out failed', { error: error.message });
        return { error };
      }

      // Limpiar estado local
      setUser(null);
      
      // Realizar auditoría de seguridad después del logout
      await performSecurityAuditCheck();
      
      logUserAction('Sign out successful');
      return { error: null };
    } catch (error) {
      logError('Sign out exception', { error });
      return { error };
    }
  };

  // Función básica de debug
  const getDebugInfo = () => {
    return {
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      loading,
      timestamp: new Date().toISOString()
    };
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    getDebugInfo,
    franchisee: null,
    restaurants: [],
    connectionStatus: 'online',
    effectiveFranchisee: null,
    isImpersonating: false,
    impersonatedFranchisee: null,
    startImpersonation: async () => {},
    stopImpersonation: () => {},
    signUp: async () => ({ data: null, error: 'Not implemented' }),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
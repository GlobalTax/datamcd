import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { AuthUser } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { performSecurityAudit } from '@/utils/securityCleanup';
import { useSecureLogging } from '@/hooks/useSecureLogging';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ data: null, error: null }),
  signOut: async () => ({ error: null }),
});

export const useAuth = () => useContext(AuthContext);

interface Props {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Integrar logging seguro
  const { logInfo, logError, logSecurity, logUserAction } = useSecureLogging();

  const performSecurityAudit = useCallback(async () => {
    try {
      logSecurity('Starting security audit for localStorage');
      
      // Realizar auditoría de seguridad
      const result = await performSecurityAudit();
      
      if (result.cleanedKeys.length > 0) {
        logSecurity('Security cleanup completed', {
          cleanedKeysCount: result.cleanedKeys.length,
          success: result.success
        });
        
        // Notificar al usuario si se encontraron datos sensibles
        console.warn('⚠️ SECURITY: Se encontraron y eliminaron datos sensibles del almacenamiento local');
      } else {
        logInfo('Security audit completed - no sensitive data found');
      }
    } catch (error) {
      logError('Security audit failed', error);
    }
  }, [logSecurity, logInfo, logError]);

  // Función para login seguro
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      logUserAction('login_attempt', 'auth', undefined, { email: email.substring(0, 3) + '***' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logSecurity('Login failed', { 
          error: error.message, 
          email: email.substring(0, 3) + '***' 
        });
        throw error;
      }

      if (data.user) {
        logUserAction('login_success', 'auth', data.user.id);
        // Realizar auditoría de seguridad después del login
        performSecurityAudit();
      }

      return { data, error: null };
    } catch (error) {
      logError('Sign in error', error);
      return { data: null, error };
    }
  }, [logUserAction, logSecurity, logError, performSecurityAudit]);

  // Función para logout seguro
  const signOut = useCallback(async () => {
    try {
      const currentUserId = user?.id;
      
      logUserAction('logout_attempt', 'auth', currentUserId);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logError('Logout failed', error);
        throw error;
      }
      
      // Limpiar datos sensibles al hacer logout
      performSecurityAudit();
      
      logUserAction('logout_success', 'auth', currentUserId);
      
      return { error: null };
    } catch (error) {
      logError('Sign out error', error);
      return { error };
    }
  }, [user?.id, logUserAction, logError, performSecurityAudit]);

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user as AuthUser);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  useEffect(() => {
    logInfo('AuthProvider mounted');
    
    // Realizar auditoría inicial
    performSecurityAudit();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logInfo('Auth state changed', { event, hasSession: !!session });
        
        setLoading(true);
        
        if (event === 'SIGNED_IN' && session?.user) {
          logUserAction('session_started', 'auth', session.user.id);
          setUser(session.user as AuthUser);
        } else if (event === 'SIGNED_OUT') {
          logUserAction('session_ended', 'auth');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          logInfo('Token refreshed', { userId: session.user.id });
          setUser(session.user as AuthUser);
        }
        
        setLoading(false);
      }
    );

    return () => {
      logInfo('AuthProvider unmounting');
      subscription.unsubscribe();
    };
  }, [logInfo, logUserAction, performSecurityAudit]);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


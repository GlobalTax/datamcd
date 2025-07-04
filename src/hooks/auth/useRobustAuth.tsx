import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './AuthContext';
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { useOptimizedUserDataFetcher } from './useOptimizedUserDataFetcher';
import { toast } from 'sonner';

export { useAuth } from './AuthContext';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000
};

export const RobustAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    setUser,
    session,
    setSession,
    franchisee,
    setFranchisee,
    restaurants,
    setRestaurants,
    loading,
    setLoading,
    clearUserData
  } = useAuthState();

  const { fetchUserData } = useOptimizedUserDataFetcher();
  const { signIn, signUp, signOut } = useAuthActions({
    clearUserData,
    setSession
  });

  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'reconnecting'>('online');
  const authInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const retryTimeouts = useRef<Set<NodeJS.Timeout>>(new Set());

  // Función para reintentar operaciones con backoff exponencial
  const retryWithBackoff = useCallback(async <T,>(
    operation: () => Promise<T>,
    config: RetryConfig = defaultRetryConfig,
    context: string = 'operation'
  ): Promise<T | null> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 0) {
          console.log(`${context} - Éxito en intento ${attempt + 1}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        console.log(`${context} - Intento ${attempt + 1} falló:`, lastError.message);
        
        if (attempt === config.maxRetries) {
          break;
        }
        
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        );
        
        setConnectionStatus('reconnecting');
        
        await new Promise(resolve => {
          const timeout = setTimeout(resolve, delay);
          retryTimeouts.current.add(timeout);
        });
      }
    }
    
    setConnectionStatus('offline');
    console.error(`${context} - Fallaron todos los intentos:`, lastError);
    return null;
  }, []);

  // Función robusta para obtener datos del usuario
  const fetchUserDataRobust = useCallback(async (userId: string) => {
    setConnectionStatus('reconnecting');
    
    const userData = await retryWithBackoff(
      () => fetchUserData(userId),
      defaultRetryConfig,
      'fetchUserData'
    );

    if (userData) {
      setUser(userData);
      setFranchisee(userData.franchisee);
      setRestaurants(userData.restaurants || []);
      setConnectionStatus('online');
      console.log('RobustAuth - Datos de usuario cargados correctamente');
    } else {
      setConnectionStatus('offline');
      toast.error('Error al cargar datos del usuario. Trabajando en modo offline.');
      
      // Fallback con datos básicos
      setUser({
        id: userId,
        email: 'usuario@ejemplo.com',
        full_name: 'Usuario',
        role: 'franchisee'
      });
    }
  }, [fetchUserData, setUser, setFranchisee, setRestaurants, retryWithBackoff]);

  // Efecto principal de autenticación
  useEffect(() => {
    if (authInitialized.current) return;
    
    console.log('RobustAuth - Inicializando sistema de autenticación robusto');
    authInitialized.current = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('RobustAuth - Cambio de estado:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user && currentUserId.current !== session.user.id) {
          currentUserId.current = session.user.id;
          await fetchUserDataRobust(session.user.id);
        } else if (!session?.user) {
          console.log('RobustAuth - Sin sesión, limpiando datos');
          currentUserId.current = null;
          clearUserData();
          setConnectionStatus('online');
        }
        setLoading(false);
      }
    );

    // Verificar sesión inicial
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('RobustAuth - Verificación inicial de sesión:', session?.user?.id);
        
        setSession(session);
        if (session?.user && currentUserId.current !== session.user.id) {
          currentUserId.current = session.user.id;
          await fetchUserDataRobust(session.user.id);
        }
        setLoading(false);
      } catch (error) {
        console.error('RobustAuth - Error en inicialización:', error);
        setLoading(false);
        setConnectionStatus('offline');
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      authInitialized.current = false;
      
      // Limpiar timeouts pendientes
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current.clear();
    };
  }, [fetchUserDataRobust, setSession, clearUserData, setLoading]);

  // Monitoreo de conectividad
  useEffect(() => {
    const handleOnline = () => {
      console.log('RobustAuth - Conexión restaurada');
      setConnectionStatus('online');
      
      // Revalidar usuario si hay sesión
      if (session?.user && currentUserId.current) {
        fetchUserDataRobust(currentUserId.current);
      }
    };

    const handleOffline = () => {
      console.log('RobustAuth - Conexión perdida');
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [session, fetchUserDataRobust]);

  const value = {
    user,
    session,
    franchisee,
    restaurants,
    loading,
    connectionStatus,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './auth/AuthContext';
import { useAuthState } from './auth/useAuthState';
import { useUserDataFetcher } from './auth/useUserDataFetcher';
import { useAuthActions } from './auth/useAuthActions';
import { showError } from '@/utils/notifications';

export { useAuth } from './auth/AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const { fetchUserData } = useUserDataFetcher();
  const { signIn, signUp, signOut } = useAuthActions({
    clearUserData,
    setSession
  });

  // Control flags mejorados
  const isInitialized = useRef(false);
  const isInitializing = useRef(false);
  const isFetchingUserData = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const lastErrorTime = useRef<number>(0);

  const refreshData = useCallback(async () => {
    if (isFetchingUserData.current) {
      console.log('AuthProvider - Refresh already in progress, skipping');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && currentUserId.current !== session.user.id) {
      try {
        console.log('AuthProvider - Refreshing data for user:', session.user.id);
        isFetchingUserData.current = true;
        setLoading(true);
        
        const userData = await fetchUserData(session.user.id);
        setUser(userData.user);
        setFranchisee(userData.franchisee);
        setRestaurants(userData.restaurants);
        currentUserId.current = session.user.id;
        
        console.log('AuthProvider - Data refresh successful');
      } catch (error) {
        console.error('AuthProvider - Error refreshing data:', error);
        
        // Implementar modo de recuperación: permitir acceso básico
        const basicUser = {
          id: session.user.id,
          email: session.user.email || 'usuario@ejemplo.com',
          role: 'franchisee' as const,
          full_name: session.user.user_metadata?.full_name || 'Usuario',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(basicUser);
        setFranchisee(null);
        setRestaurants([]);
        currentUserId.current = session.user.id;
        
        // Mostrar error solo si han pasado más de 30 segundos del último error
        const now = Date.now();
        if (now - lastErrorTime.current > 30000) {
          showError('Modo limitado: Algunos datos no se pudieron cargar. Las funcionalidades pueden estar limitadas.');
          lastErrorTime.current = now;
        }
        
        console.log('AuthProvider - Using recovery mode with basic user data');
      } finally {
        setLoading(false);
        isFetchingUserData.current = false;
      }
    }
  }, [fetchUserData, setUser, setFranchisee, setRestaurants, setLoading]);

  // Manejo optimizado de cambios de autenticación
  const handleAuthChange = useCallback(async (event: string, session: any) => {
    if (isFetchingUserData.current) {
      console.log('AuthProvider - Auth change ignored, fetch in progress');
      return;
    }

    console.log('AuthProvider - Auth state change:', event, session?.user?.id);
    
    setSession(session);
    
    if (session?.user && currentUserId.current !== session.user.id) {
      console.log('AuthProvider - New user session, fetching data');
      currentUserId.current = session.user.id;
      setLoading(true);
      isFetchingUserData.current = true;
      
      try {
        const userData = await fetchUserData(session.user.id);
        setUser(userData.user);
        setFranchisee(userData.franchisee);
        setRestaurants(userData.restaurants);
        console.log('AuthProvider - User data loaded successfully');
      } catch (error) {
        console.error('AuthProvider - Error loading user data, using recovery mode:', error);
        
        // Modo de recuperación mejorado
        const recoveryUser = {
          id: session.user.id,
          email: session.user.email || 'usuario@ejemplo.com',
          role: 'franchisee' as const,
          full_name: session.user.user_metadata?.full_name || 'Usuario',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(recoveryUser);
        setFranchisee(null);
        setRestaurants([]);
        
        // Intentar cargar los datos en segundo plano
        setTimeout(() => {
          console.log('AuthProvider - Background retry for full data loading');
          refreshData();
        }, 5000);
        
        console.log('AuthProvider - Recovery mode activated, background retry scheduled');
      } finally {
        setLoading(false);
        isFetchingUserData.current = false;
      }
    } else if (!session?.user) {
      console.log('AuthProvider - No session, clearing data');
      currentUserId.current = null;
      clearUserData();
      setLoading(false);
      isFetchingUserData.current = false;
    }
  }, [fetchUserData, setUser, setFranchisee, setRestaurants, setSession, setLoading, clearUserData, refreshData]);

  useEffect(() => {
    // Prevenir múltiples inicializaciones
    if (isInitialized.current || isInitializing.current) {
      console.log('AuthProvider - Already initialized or initializing, skipping');
      return;
    }
    
    console.log('AuthProvider - Initializing enhanced auth system');
    isInitializing.current = true;
    setLoading(true);
    
    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    subscriptionRef.current = subscription;
    
    // Verificar sesión inicial con timeout aumentado
    const initializeAuth = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 8000) // Aumentado de 3s a 8s
        );
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        console.log('AuthProvider - Initial session check:', session?.user?.id);
        
        if (session?.user) {
          await handleAuthChange('SIGNED_IN', session);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider - Error in initial auth check:', error);
        setLoading(false);
        
        // Si falla la verificación inicial, intentar de nuevo en 3 segundos
        setTimeout(() => {
          console.log('AuthProvider - Retrying initial session check');
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              handleAuthChange('SIGNED_IN', session);
            }
          }).catch(console.error);
        }, 3000);
      } finally {
        isInitializing.current = false;
        isInitialized.current = true;
      }
    };
    
    initializeAuth();
    
    return () => {
      console.log('AuthProvider - Cleaning up');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      isInitialized.current = false;
      isInitializing.current = false;
      isFetchingUserData.current = false;
    };
  }, []); // Empty dependency array

  console.log('AuthProvider - Current state:', { 
    user: user ? { id: user.id, role: user.role } : null, 
    session: !!session, 
    loading,
    franchisee: !!franchisee,
    restaurantsCount: restaurants.length,
    isInitialized: isInitialized.current,
    isInitializing: isInitializing.current,
    isFetching: isFetchingUserData.current
  });

  const value = {
    user,
    session,
    franchisee,
    restaurants,
    loading,
    signIn,
    signUp,
    signOut,
    refreshData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

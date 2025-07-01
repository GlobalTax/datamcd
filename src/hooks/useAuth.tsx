
import React, { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './auth/AuthContext';
import { useAuthState } from './auth/useAuthState';
import { useUserDataFetcher } from './auth/useUserDataFetcher';
import { useFastAuthActions } from './auth/useFastAuthActions';
import { useAuthRecovery } from './auth/useAuthRecovery';
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
  const { attemptDataRecovery, isRecoveryMode } = useAuthRecovery();

  // Control flags optimizados
  const isInitialized = useRef(false);
  const isInitializing = useRef(false);
  const isFetchingUserData = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const lastErrorTime = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        await handleDataLoadError(session.user.id, session.user);
      } finally {
        setLoading(false);
        isFetchingUserData.current = false;
      }
    }
  }, [fetchUserData, setUser, setFranchisee, setRestaurants, setLoading]);

  const handleDataLoadError = useCallback(async (userId: string, user: any) => {
    console.log('AuthProvider - Handling data load error for user:', userId);
    
    // Si es usuario de emergencia, manejar diferente
    if (userId.startsWith('emergency-')) {
      console.log('AuthProvider - Emergency user detected, setting up basic access');
      const basicUser = {
        id: userId,
        email: user.email || 'emergency@ejemplo.com',
        role: 'franchisee' as const,
        full_name: user.user_metadata?.full_name || 'Usuario de Emergencia',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(basicUser);
      setFranchisee(null);
      setRestaurants([]);
      currentUserId.current = userId;
      return;
    }
    
    // Crear usuario básico inmediatamente para usuarios normales
    const basicUser = {
      id: userId,
      email: user.email || 'usuario@ejemplo.com',
      role: 'franchisee' as const,
      full_name: user.user_metadata?.full_name || 'Usuario',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setUser(basicUser);
    setFranchisee(null);
    setRestaurants([]);
    currentUserId.current = userId;
    
    // Intentar recuperación de datos en segundo plano solo para usuarios normales
    setTimeout(async () => {
      try {
        console.log('AuthProvider - Attempting background data recovery');
        await attemptDataRecovery(userId);
        
        // Intentar cargar datos nuevamente después de la recuperación
        const userData = await fetchUserData(userId);
        if (userData.user && !userData.user.id.startsWith('temp-')) {
          setUser(userData.user);
          setFranchisee(userData.franchisee);
          setRestaurants(userData.restaurants);
          console.log('AuthProvider - Background recovery successful');
        }
      } catch (recoveryError) {
        console.log('AuthProvider - Background recovery failed, user has basic access');
      }
    }, 3000); // Aumentado a 3 segundos para dar más tiempo
    
    // Mostrar error solo ocasionalmente
    const now = Date.now();
    if (now - lastErrorTime.current > 60000) { // Reducir frecuencia de errores
      showError('Modo básico activado. Algunas funciones pueden estar limitadas.');
      lastErrorTime.current = now;
    }
  }, [attemptDataRecovery, fetchUserData, setUser, setFranchisee, setRestaurants]);

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
        // Para usuarios de emergencia, configuración inmediata
        if (session.user.id.startsWith('emergency-')) {
          console.log('AuthProvider - Emergency user detected, immediate setup');
          await handleDataLoadError(session.user.id, session.user);
        } else {
          // Para usuarios normales, intentar carga de datos con timeout más corto
          const userData = await Promise.race([
            fetchUserData(session.user.id),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Data load timeout')), 8000)
            )
          ]) as any;
          
          setUser(userData.user);
          setFranchisee(userData.franchisee);
          setRestaurants(userData.restaurants);
          console.log('AuthProvider - User data loaded successfully');
        }
      } catch (error) {
        console.error('AuthProvider - Error loading user data:', error);
        await handleDataLoadError(session.user.id, session.user);
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
  }, [fetchUserData, setUser, setFranchisee, setRestaurants, setSession, setLoading, clearUserData, handleDataLoadError]);

  useEffect(() => {
    // Prevenir múltiples inicializaciones
    if (isInitialized.current || isInitializing.current) {
      console.log('AuthProvider - Already initialized or initializing, skipping');
      return;
    }
    
    console.log('AuthProvider - Initializing optimized auth system');
    isInitializing.current = true;
    setLoading(true);
    
    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    subscriptionRef.current = subscription;
    
    // Verificar sesión inicial con sistema de recuperación
    const initializeAuth = async () => {
      try {
        // Timeout reducido a 3s para detección más rápida de problemas
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 3000)
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
        
        // Programar reintento en segundo plano con tiempo extendido
        retryTimeoutRef.current = setTimeout(() => {
          console.log('AuthProvider - Extended background retry for session check');
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              handleAuthChange('SIGNED_IN', session);
            }
          }).catch(console.error);
        }, 5000); // Aumentado a 5 segundos
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
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
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
    isFetching: isFetchingUserData.current,
    recoveryMode: isRecoveryMode
  });

  const { fastSignIn, fastSignUp, signOut } = useFastAuthActions({
    clearUserData,
    setSession,
    onAuthSuccess: (userData) => {
      if (userData.user) {
        setUser(userData.user);
        setFranchisee(userData.franchisee || null);
        setRestaurants(userData.restaurants || []);
      }
    }
  });

  const value = {
    user,
    session,
    franchisee,
    restaurants,
    loading,
    signIn: fastSignIn,
    signUp: fastSignUp,
    signOut,
    refreshData,
    clearUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

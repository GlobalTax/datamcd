
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStaticData } from './useStaticData';
import { useRealUserData } from './auth/useRealUserData';
import { useFallbackData } from './auth/useFallbackData';
import { useAuthActions } from './auth/useAuthActions';
import { AuthState, AuthActions } from './auth/types';

export const useUnifiedAuth = (): AuthState & AuthActions => {
  const [user, setUser] = useState(null);
  const [franchisee, setFranchisee] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
  
  const { isUsingCache } = useStaticData();
  const { loadRealUserData } = useRealUserData();
  const { loadFallbackData } = useFallbackData();
  const { signIn, signUp, signOut: authSignOut } = useAuthActions();
  
  // Refs para evitar bucles infinitos
  const initializingRef = useRef(false);
  const currentUserIdRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup cuando se desmonta el componente
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Limpiar estado
  const clearAuthState = useCallback(() => {
    setUser(null);
    setFranchisee(null);
    setRestaurants([]);
    currentUserIdRef.current = null;
  }, []);

  // Inicializar autenticación
  const initializeAuth = useCallback(async () => {
    if (initializingRef.current || !mountedRef.current) {
      return;
    }

    initializingRef.current = true;
    
    try {
      console.log('Initializing auth...');
      setConnectionStatus('connecting');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!mountedRef.current) return;

      if (sessionError) {
        throw sessionError;
      }

      if (session?.user && currentUserIdRef.current !== session.user.id) {
        currentUserIdRef.current = session.user.id;
        console.log('User session found, loading data for:', session.user.id);
        
        try {
          const realData = await loadRealUserData(session.user.id);
          
          if (!mountedRef.current) return;
          
          setUser(realData.user);
          setFranchisee(realData.franchisee || null);
          setRestaurants(realData.restaurants || []);
          setConnectionStatus('connected');
          
        } catch (error) {
          console.log('Real data loading failed, using fallback');
          if (!mountedRef.current) return;
          
          const fallbackData = await loadFallbackData();
          setUser(fallbackData.user);
          setFranchisee(fallbackData.franchisee);
          setRestaurants(fallbackData.restaurants);
          setConnectionStatus('fallback');
        }
      } else if (!session?.user) {
        clearAuthState();
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      if (!mountedRef.current) return;
      
      try {
        const fallbackData = await loadFallbackData();
        setUser(fallbackData.user);
        setFranchisee(fallbackData.franchisee);
        setRestaurants(fallbackData.restaurants);
        setConnectionStatus('fallback');
      } catch (fallbackError) {
        console.error('Fallback data loading failed:', fallbackError);
        clearAuthState();
        setConnectionStatus('fallback');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        initializingRef.current = false;
      }
    }
  }, [loadRealUserData, loadFallbackData, clearAuthState]);

  const signOut = useCallback(async () => {
    try {
      clearAuthState();
      setConnectionStatus('connecting');
      await authSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [clearAuthState, authSignOut]);

  const refreshData = useCallback(async () => {
    if (!initializingRef.current) {
      setLoading(true);
      await initializeAuth();
    }
  }, [initializeAuth]);

  // Efecto principal
  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const setupAuth = async () => {
      if (mounted) {
        await initializeAuth();
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT') {
          clearAuthState();
          setConnectionStatus('connecting');
        } else if (event === 'SIGNED_IN' && session?.user) {
          if (currentUserIdRef.current !== session.user.id) {
            setLoading(true);
            setTimeout(() => {
              if (mounted) {
                initializeAuth();
              }
            }, 0);
          }
        }
      }
    );

    return () => {
      mounted = false;
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [initializeAuth, clearAuthState]);

  return {
    user,
    franchisee,
    restaurants,
    loading,
    connectionStatus,
    isUsingCache: connectionStatus === 'fallback' || isUsingCache,
    signIn,
    signUp,
    signOut,
    refreshData
  };
};

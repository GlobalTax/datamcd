import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee } from '@/types/auth';
import { useStaticData } from './useStaticData';
import { useAuthActions } from './auth/useAuthActions';
import { useAuthInitializer } from './auth/useAuthInitializer';

interface AuthState {
  user: User | null;
  franchisee: Franchisee | null;
  restaurants: any[];
  loading: boolean;
  connectionStatus: 'connecting' | 'connected' | 'fallback';
  isUsingCache: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useUnifiedAuth = (): AuthState & AuthActions => {
  const [user, setUser] = useState<User | null>(null);
  const [franchisee, setFranchisee] = useState<Franchisee | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { isUsingCache } = useStaticData();
  const { signIn, signUp, signOut: authSignOut } = useAuthActions();
  const { 
    initializeAuth, 
    connectionStatus, 
    setConnectionStatus,
    currentUserIdRef,
    mountedRef 
  } = useAuthInitializer();

  // Refs para evitar bucles infinitos
  const initializingRef = useRef(false);

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

  // Wrapper para signOut que limpia el estado
  const signOut = useCallback(async () => {
    try {
      clearAuthState();
      setConnectionStatus('connecting');
      await authSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [clearAuthState, setConnectionStatus, authSignOut]);

  const refreshData = useCallback(async () => {
    if (!initializingRef.current) {
      setLoading(true);
      const authData = await initializeAuth();
      if (mountedRef.current) {
        setUser(authData.user);
        setFranchisee(authData.franchisee);
        setRestaurants(authData.restaurants);
        setLoading(false);
      }
    }
  }, [initializeAuth]);

  // Efecto principal optimizado
  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const setupAuth = async () => {
      if (mounted && !initializingRef.current) {
        initializingRef.current = true;
        const authData = await initializeAuth();
        if (mounted) {
          setUser(authData.user);
          setFranchisee(authData.franchisee);
          setRestaurants(authData.restaurants);
          setLoading(false);
          initializingRef.current = false;
        }
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
                setupAuth();
              }
            }, 100);
          }
        }
      }
    );

    return () => {
      mounted = false;
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [initializeAuth, clearAuthState, setConnectionStatus]);

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

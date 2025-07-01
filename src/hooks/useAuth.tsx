
import React, { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './auth/AuthContext';
import { useAuthState } from './auth/useAuthState';
import { useUserDataFetcher } from './auth/useUserDataFetcher';
import { useAuthActions } from './auth/useAuthActions';

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

  // Ref para evitar llamadas duplicadas
  const isInitializing = useRef(false);
  const currentUserId = useRef<string | null>(null);

  const refreshData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && currentUserId.current !== session.user.id) {
      try {
        console.log('AuthProvider - Refreshing data for user:', session.user.id);
        const userData = await fetchUserData(session.user.id);
        setUser(userData.user);
        setFranchisee(userData.franchisee);
        setRestaurants(userData.restaurants);
        currentUserId.current = session.user.id;
      } catch (error) {
        console.error('AuthProvider - Error refreshing data:', error);
        // En caso de error, limpiar datos y permitir reintento
        clearUserData();
        currentUserId.current = null;
      }
    }
  }, [fetchUserData, setUser, setFranchisee, setRestaurants, clearUserData]);

  // Función para manejar cambios de autenticación
  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log('AuthProvider - Auth state change:', event, session?.user?.id);
    
    setSession(session);
    
    if (session?.user && currentUserId.current !== session.user.id) {
      console.log('AuthProvider - New user session, fetching data');
      currentUserId.current = session.user.id;
      setLoading(true);
      
      try {
        const userData = await fetchUserData(session.user.id);
        setUser(userData.user);
        setFranchisee(userData.franchisee);
        setRestaurants(userData.restaurants);
        console.log('AuthProvider - User data loaded successfully');
      } catch (error) {
        console.error('AuthProvider - Error loading user data:', error);
        // En caso de error, limpiar datos
        clearUserData();
        currentUserId.current = null;
      } finally {
        setLoading(false);
      }
    } else if (!session?.user) {
      console.log('AuthProvider - No session, clearing data');
      currentUserId.current = null;
      clearUserData();
      setLoading(false);
    }
  }, [fetchUserData, setUser, setFranchisee, setRestaurants, setSession, setLoading, clearUserData]);

  useEffect(() => {
    if (isInitializing.current) return;
    
    console.log('AuthProvider - Initializing auth system');
    isInitializing.current = true;
    setLoading(true);
    
    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    
    // Verificar sesión inicial
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('AuthProvider - Initial session check:', session?.user?.id);
        
        if (session?.user) {
          await handleAuthChange('SIGNED_IN', session);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider - Error in initial auth check:', error);
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
      isInitializing.current = false;
    };
  }, [handleAuthChange, setLoading]);

  console.log('AuthProvider - Current state:', { 
    user: user ? { id: user.id, role: user.role } : null, 
    session: !!session, 
    loading,
    franchisee: !!franchisee,
    restaurantsCount: restaurants.length
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

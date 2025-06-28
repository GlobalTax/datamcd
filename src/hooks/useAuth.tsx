
import React, { useEffect, useRef } from 'react';
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

  const { fetchUserData } = useUserDataFetcher({
    setUser,
    setFranchisee,
    setRestaurants,
    clearUserData
  });

  const { signIn, signUp, signOut } = useAuthActions({
    clearUserData,
    setSession
  });

  // Use ref to prevent duplicate calls
  const authInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    if (authInitialized.current) return;
    
    console.log('useAuth - Setting up auth state listener');
    authInitialized.current = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth - Auth state change:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user && currentUserId.current !== session.user.id) {
          console.log('useAuth - User found in session, fetching user data');
          currentUserId.current = session.user.id;
          try {
            await fetchUserData(session.user.id);
            console.log('useAuth - User data fetch completed');
          } catch (error) {
            console.error('useAuth - Error fetching user data:', error);
          }
        } else if (!session?.user) {
          console.log('useAuth - No session, clearing user data');
          currentUserId.current = null;
          clearUserData();
        }
        setLoading(false);
      }
    );

    // Check for existing session only once
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('useAuth - Initial session check:', session?.user?.id);
      setSession(session);
      if (session?.user && currentUserId.current !== session.user.id) {
        currentUserId.current = session.user.id;
        try {
          await fetchUserData(session.user.id);
          console.log('useAuth - Initial user data fetch completed');
        } catch (error) {
          console.error('useAuth - Error in initial user data fetch:', error);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      authInitialized.current = false;
    };
  }, []);

  console.log('useAuth - Current state:', { 
    user: user ? { id: user.id, role: user.role } : null, 
    session: !!session, 
    loading 
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

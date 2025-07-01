
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

  // Control flags to prevent multiple initializations and concurrent calls
  const isInitialized = useRef(false);
  const isInitializing = useRef(false);
  const isFetchingUserData = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const subscriptionRef = useRef<any>(null);

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
        const userData = await fetchUserData(session.user.id);
        setUser(userData.user);
        setFranchisee(userData.franchisee);
        setRestaurants(userData.restaurants);
        currentUserId.current = session.user.id;
      } catch (error) {
        console.error('AuthProvider - Error refreshing data:', error);
        clearUserData();
        currentUserId.current = null;
      } finally {
        isFetchingUserData.current = false;
      }
    }
  }, [fetchUserData, setUser, setFranchisee, setRestaurants, clearUserData]);

  // Optimized auth change handler with concurrency control
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
        console.error('AuthProvider - Error loading user data:', error);
        clearUserData();
        currentUserId.current = null;
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
  }, [fetchUserData, setUser, setFranchisee, setRestaurants, setSession, setLoading, clearUserData]);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current || isInitializing.current) {
      console.log('AuthProvider - Already initialized or initializing, skipping');
      return;
    }
    
    console.log('AuthProvider - Initializing auth system');
    isInitializing.current = true;
    setLoading(true);
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    subscriptionRef.current = subscription;
    
    // Check initial session with timeout
    const initializeAuth = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
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
  }, []); // Empty dependency array to run only once

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

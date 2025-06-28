
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee } from '@/types/auth';
import { useStaticData } from '../useStaticData';
import { useUserDataLoader } from './useUserDataLoader';
import { useAuthTimeouts } from './useAuthTimeouts';

export const useAuthInitializer = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
  const { getFranchiseeData, getRestaurantsData } = useStaticData();
  const { loadRealUserData } = useUserDataLoader();
  const { withTimeout } = useAuthTimeouts();

  // Refs para evitar bucles infinitos
  const currentUserIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Cargar datos de fallback
  const loadFallbackData = useCallback(async () => {
    console.log('Loading fallback data');
    
    const fallbackUser: User = {
      id: 'fallback-user',
      email: 'fallback@ejemplo.com',
      role: 'franchisee',
      full_name: 'Usuario Fallback',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fallbackFranchisee = await getFranchiseeData('fallback-user');
    const fallbackRestaurants = await getRestaurantsData(fallbackFranchisee.id);

    return {
      user: fallbackUser,
      franchisee: fallbackFranchisee,
      restaurants: fallbackRestaurants
    };
  }, [getFranchiseeData, getRestaurantsData]);

  // Inicializar autenticación mejorada
  const initializeAuth = useCallback(async () => {
    try {
      console.log('Initializing auth...');
      setConnectionStatus('connecting');
      
      const { data: { session }, error: sessionError } = await withTimeout(
        supabase.auth.getSession(),
        3000
      );

      if (!mountedRef.current) return { user: null, franchisee: null, restaurants: [] };

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (session?.user && currentUserIdRef.current !== session.user.id) {
        currentUserIdRef.current = session.user.id;
        console.log('User session found, loading data for:', session.user.id);
        
        try {
          const realData = await loadRealUserData(session.user.id);
          
          if (!mountedRef.current) return { user: null, franchisee: null, restaurants: [] };
          
          setConnectionStatus('connected');
          return {
            user: realData.user,
            franchisee: realData.franchisee || null,
            restaurants: realData.restaurants || []
          };
          
        } catch (error) {
          console.log('Real data loading failed, using fallback:', error);
          if (!mountedRef.current) return { user: null, franchisee: null, restaurants: [] };
          
          const fallbackData = await loadFallbackData();
          setConnectionStatus('fallback');
          return fallbackData;
        }
      } else if (!session?.user) {
        currentUserIdRef.current = null;
        setConnectionStatus('connected');
        return { user: null, franchisee: null, restaurants: [] };
      }

      return { user: null, franchisee: null, restaurants: [] };
    } catch (error) {
      console.error('Auth initialization failed:', error);
      if (!mountedRef.current) return { user: null, franchisee: null, restaurants: [] };
      
      try {
        const fallbackData = await loadFallbackData();
        setConnectionStatus('fallback');
        return fallbackData;
      } catch (fallbackError) {
        console.error('Fallback data loading failed:', fallbackError);
        setConnectionStatus('fallback');
        return { user: null, franchisee: null, restaurants: [] };
      }
    }
  }, [withTimeout, loadRealUserData, loadFallbackData]);

  return {
    initializeAuth,
    connectionStatus,
    setConnectionStatus,
    currentUserIdRef,
    mountedRef
  };
};

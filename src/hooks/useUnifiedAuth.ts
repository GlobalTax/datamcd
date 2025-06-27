
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee } from '@/types/auth';
import { useStaticData } from './useStaticData';

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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
  
  const { getFranchiseeData, getRestaurantsData, isUsingCache } = useStaticData();
  
  // Refs para evitar bucles infinitos
  const initializingRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Cleanup cuando se desmonta el componente
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Timeout helper para evitar bloqueos
  const withTimeout = useCallback(async <T>(
    promise: Promise<T>, 
    timeoutMs: number = 8000
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }, []);

  // Cargar datos del usuario real
  const loadRealUserData = useCallback(async (userId: string): Promise<{
    user: User;
    franchisee?: Franchisee;
    restaurants?: any[];
  }> => {
    console.log('loadRealUserData - Starting for user:', userId);
    
    try {
      // Cargar perfil
      const profilePromise = supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .maybeSingle();

      const { data: profile, error: profileError } = await withTimeout(
        profilePromise,
        5000
      );

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      const userData: User = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        full_name: profile.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Si es franchisee, cargar datos adicionales
      if (profile.role === 'franchisee') {
        try {
          const franchiseePromise = supabase
            .from('franchisees')
            .select('id, user_id, franchisee_name, company_name, total_restaurants, created_at, updated_at')
            .eq('user_id', userId)
            .maybeSingle();

          const { data: franchiseeData, error: franchiseeError } = await withTimeout(
            franchiseePromise,
            5000
          );

          if (!franchiseeError && franchiseeData) {
            const restaurantsPromise = supabase
              .from('franchisee_restaurants')
              .select(`
                id,
                monthly_rent,
                last_year_revenue,
                status,
                base_restaurant:base_restaurants!inner(
                  id,
                  site_number,
                  restaurant_name,
                  address,
                  city,
                  restaurant_type
                )
              `)
              .eq('franchisee_id', franchiseeData.id)
              .eq('status', 'active')
              .limit(20);

            const { data: restaurantsData } = await withTimeout(
              restaurantsPromise,
              8000
            );

            console.log('Real data loaded successfully');
            return {
              user: userData,
              franchisee: franchiseeData,
              restaurants: restaurantsData || []
            };
          }
        } catch (error) {
          console.log('Franchisee data not available:', error);
        }
      }

      return { user: userData };
    } catch (error) {
      console.error('Error loading real user data:', error);
      throw error;
    }
  }, [withTimeout]);

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

  // Limpiar estado
  const clearAuthState = useCallback(() => {
    setUser(null);
    setFranchisee(null);
    setRestaurants([]);
    currentUserIdRef.current = null;
  }, []);

  // Inicializar autenticación - memoizada para evitar bucles
  const initializeAuth = useCallback(async () => {
    if (initializingRef.current || !mountedRef.current) {
      return;
    }

    initializingRef.current = true;
    
    try {
      console.log('Initializing auth...');
      setConnectionStatus('connecting');
      
      const { data: { session }, error: sessionError } = await withTimeout(
        supabase.auth.getSession(),
        3000
      );

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
  }, [withTimeout, loadRealUserData, loadFallbackData, clearAuthState]);

  // Acciones de autenticación
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error) {
      return { error: 'Error de conexión' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName }
        }
      });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error) {
      return { error: 'Error de conexión' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      clearAuthState();
      setConnectionStatus('connecting');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [clearAuthState]);

  const refreshData = useCallback(async () => {
    if (!initializingRef.current) {
      setLoading(true);
      await initializeAuth();
    }
  }, [initializeAuth]);

  // Efecto principal - se ejecuta solo una vez
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
        
        // Solo limpiar estado en SIGNED_OUT, no reinicializar todo
        if (event === 'SIGNED_OUT') {
          clearAuthState();
          setConnectionStatus('connecting');
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Solo reinicializar si es un usuario diferente
          if (currentUserIdRef.current !== session.user.id) {
            setLoading(true);
            // Usar setTimeout para evitar llamadas síncronas en el callback
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
  }, []); // Dependencias vacías para ejecutar solo una vez

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

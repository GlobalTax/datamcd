import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee, Restaurant } from '@/types/auth';

interface AuthState {
  user: User | null;
  franchisee: Franchisee | null;
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  session: any;
}

export const useOptimizedSimpleAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    franchisee: null,
    restaurants: [],
    loading: true,
    error: null,
    isAuthenticated: false,
    session: null
  });

  const clearState = useCallback(() => {
    setState({
      user: null,
      franchisee: null,
      restaurants: [],
      loading: false,
      error: null,
      isAuthenticated: false,
      session: null
    });
  }, []);

  const setError = useCallback((error: string) => {
    console.error('useOptimizedSimpleAuth - Error:', error);
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const fetchUserProfile = useCallback(async (userId: string): Promise<User> => {
    console.log('useOptimizedSimpleAuth - Fetching profile for:', userId);
    
    // Implementar timeout para evitar bloqueos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout al cargar perfil')), 10000)
    );

    const fetchPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      console.error('useOptimizedSimpleAuth - Profile fetch error:', error);
      
      // Si el perfil no existe, crear uno básico
      if (error.code === 'PGRST116') {
        console.log('useOptimizedSimpleAuth - Profile not found, creating basic profile');
        const basicProfile = {
          id: userId,
          email: 'usuario@ejemplo.com',
          full_name: 'Usuario',
          role: 'franchisee' as const,
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Intentar crear el perfil
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(basicProfile);
        
        if (insertError) {
          console.error('useOptimizedSimpleAuth - Error creating profile:', insertError);
          // Continuar con el perfil básico en memoria
          return basicProfile;
        }
        
        return basicProfile;
      }
      
      throw new Error(`Error al cargar perfil: ${error.message}`);
    }

    if (!data) {
      throw new Error('Perfil de usuario no encontrado');
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role as User['role'],
      phone: data.phone,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }, []);

  const fetchFranchiseeData = useCallback(async (userId: string, userProfile: User): Promise<Franchisee | null> => {
    console.log('useOptimizedSimpleAuth - Fetching franchisee data for:', userId);
    
    if (userProfile.role !== 'franchisee') {
      console.log('useOptimizedSimpleAuth - User is not franchisee, skipping franchisee data');
      return null;
    }

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout al cargar franquiciado')), 10000)
    );

    const fetchPromise = supabase
      .from('franchisees')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('useOptimizedSimpleAuth - No franchisee data found, this is normal for new users');
        return null;
      }
      console.error('useOptimizedSimpleAuth - Franchisee fetch error:', error);
      throw new Error(`Error al cargar datos de franquiciado: ${error.message}`);
    }

    return {
      id: data.id,
      user_id: data.user_id,
      franchisee_name: data.franchisee_name,
      company_name: data.company_name,
      tax_id: data.tax_id,
      address: data.address,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      created_at: data.created_at,
      updated_at: data.updated_at,
      total_restaurants: data.total_restaurants,
      profiles: {
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        full_name: userProfile.full_name || data.franchisee_name || ''
      },
      hasAccount: true,
      isOnline: false,
      lastAccess: new Date().toISOString()
    };
  }, []);

  const fetchRestaurants = useCallback(async (franchiseeId: string): Promise<Restaurant[]> => {
    console.log('useOptimizedSimpleAuth - Fetching restaurants for franchisee:', franchiseeId);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout al cargar restaurantes')), 10000)
    );

    const fetchPromise = supabase
      .from('franchisee_restaurants')
      .select(`
        *,
        base_restaurant:base_restaurants(*)
      `)
      .eq('franchisee_id', franchiseeId)
      .eq('status', 'active');

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      console.error('useOptimizedSimpleAuth - Restaurants fetch error:', error);
      throw new Error(`Error al cargar restaurantes: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('useOptimizedSimpleAuth - No restaurants found');
      return [];
    }

    return data
      .filter(item => item.base_restaurant)
      .map(item => ({
        id: item.base_restaurant.id,
        franchisee_id: item.franchisee_id,
        site_number: item.base_restaurant.site_number,
        restaurant_name: item.base_restaurant.restaurant_name,
        address: item.base_restaurant.address,
        city: item.base_restaurant.city,
        state: item.base_restaurant.state,
        postal_code: item.base_restaurant.postal_code,
        country: item.base_restaurant.country,
        opening_date: item.base_restaurant.opening_date,
        restaurant_type: item.base_restaurant.restaurant_type || 'traditional',
        status: 'active' as const,
        square_meters: item.base_restaurant.square_meters,
        seating_capacity: item.base_restaurant.seating_capacity,
        created_at: item.base_restaurant.created_at,
        updated_at: item.base_restaurant.updated_at
      }));
  }, []);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      console.log('useOptimizedSimpleAuth - Loading user data for:', userId);
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Cargar perfil del usuario
      const user = await fetchUserProfile(userId);
      
      // Cargar datos de franquiciado si es necesario
      let franchisee: Franchisee | null = null;
      let restaurants: Restaurant[] = [];

      if (user.role === 'franchisee') {
        franchisee = await fetchFranchiseeData(userId, user);
        
        if (franchisee) {
          restaurants = await fetchRestaurants(franchisee.id);
        }
      }

      const sessionData = await supabase.auth.getSession();

      setState({
        user,
        franchisee,
        restaurants,
        loading: false,
        error: null,
        isAuthenticated: true,
        session: sessionData.data.session
      });

      console.log('useOptimizedSimpleAuth - User data loaded successfully:', {
        user: { id: user.id, role: user.role },
        franchisee: !!franchisee,
        restaurantsCount: restaurants.length
      });

    } catch (error) {
      console.error('useOptimizedSimpleAuth - Error loading user data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  }, [fetchUserProfile, fetchFranchiseeData, fetchRestaurants, setError]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('useOptimizedSimpleAuth - Signing in:', email);
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('useOptimizedSimpleAuth - Sign in error:', error);
        setError(`Error de inicio de sesión: ${error.message}`);
        return false;
      }

      if (data.user) {
        await loadUserData(data.user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('useOptimizedSimpleAuth - Unexpected sign in error:', error);
      setError('Error inesperado durante el inicio de sesión');
      return false;
    }
  }, [loadUserData, setError]);

  const signOut = useCallback(async () => {
    try {
      console.log('useOptimizedSimpleAuth - Signing out');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('useOptimizedSimpleAuth - Sign out error:', error);
      }
      
      clearState();
    } catch (error) {
      console.error('useOptimizedSimpleAuth - Unexpected sign out error:', error);
      clearState();
    }
  }, [clearState]);

  const initializeAuth = useCallback(async () => {
    try {
      console.log('useOptimizedSimpleAuth - Initializing auth');
      
      // Obtener sesión actual
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('useOptimizedSimpleAuth - Session error:', error);
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (session?.user) {
        console.log('useOptimizedSimpleAuth - Found existing session for user:', session.user.id);
        await loadUserData(session.user.id);
      } else {
        console.log('useOptimizedSimpleAuth - No existing session found');
        setState(prev => ({ ...prev, loading: false }));
      }

      // Configurar listener para cambios de autenticación
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('useOptimizedSimpleAuth - Auth state change:', event, session?.user?.id);
          
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserData(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            clearState();
          }
        }
      );

      // Cleanup function
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('useOptimizedSimpleAuth - Initialization error:', error);
      setState(prev => ({ ...prev, loading: false, error: 'Error al inicializar autenticación' }));
    }
  }, [loadUserData, clearState]);

  useEffect(() => {
    const cleanup = initializeAuth();
    return () => {
      cleanup?.then(unsubscribe => unsubscribe?.());
    };
  }, [initializeAuth]);

  return {
    ...state,
    signIn,
    signOut,
    refreshData: () => state.user && loadUserData(state.user.id)
  };
};
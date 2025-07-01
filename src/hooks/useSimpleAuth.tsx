
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
}

export const useSimpleAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    franchisee: null,
    restaurants: [],
    loading: true,
    error: null,
    isAuthenticated: false
  });

  const clearState = useCallback(() => {
    setState({
      user: null,
      franchisee: null,
      restaurants: [],
      loading: false,
      error: null,
      isAuthenticated: false
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const fetchUserProfile = useCallback(async (userId: string): Promise<User> => {
    console.log('useSimpleAuth - Fetching profile for:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('useSimpleAuth - Profile fetch error:', error);
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
    console.log('useSimpleAuth - Fetching franchisee data for:', userId);
    
    const { data, error } = await supabase
      .from('franchisees')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró franquiciado, esto es normal para usuarios nuevos
        console.log('useSimpleAuth - No franchisee data found for user');
        return null;
      }
      console.error('useSimpleAuth - Franchisee fetch error:', error);
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
    console.log('useSimpleAuth - Fetching restaurants for franchisee:', franchiseeId);
    
    const { data, error } = await supabase
      .from('franchisee_restaurants')
      .select(`
        *,
        base_restaurant:base_restaurants(*)
      `)
      .eq('franchisee_id', franchiseeId)
      .eq('status', 'active');

    if (error) {
      console.error('useSimpleAuth - Restaurants fetch error:', error);
      throw new Error(`Error al cargar restaurantes: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('useSimpleAuth - No restaurants found');
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
      console.log('useSimpleAuth - Loading user data for:', userId);
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

      setState({
        user,
        franchisee,
        restaurants,
        loading: false,
        error: null,
        isAuthenticated: true
      });

      console.log('useSimpleAuth - User data loaded successfully:', {
        user: { id: user.id, role: user.role },
        franchisee: !!franchisee,
        restaurantsCount: restaurants.length
      });

    } catch (error) {
      console.error('useSimpleAuth - Error loading user data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    }
  }, [fetchUserProfile, fetchFranchiseeData, fetchRestaurants, setError]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('useSimpleAuth - Signing in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('useSimpleAuth - Sign in error:', error);
        return { error: error.message };
      }

      if (data.user) {
        await loadUserData(data.user.id);
      }

      return { success: true };
    } catch (error) {
      console.error('useSimpleAuth - Unexpected sign in error:', error);
      return { error: 'Error inesperado al iniciar sesión' };
    }
  }, [loadUserData]);

  const signOut = useCallback(async () => {
    try {
      console.log('useSimpleAuth - Signing out');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('useSimpleAuth - Sign out error:', error);
      }
      
      clearState();
    } catch (error) {
      console.error('useSimpleAuth - Unexpected sign out error:', error);
      clearState();
    }
  }, [clearState]);

  // Inicializar autenticación
  useEffect(() => {
    console.log('useSimpleAuth - Initializing auth');
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('useSimpleAuth - Found existing session');
          await loadUserData(session.user.id);
        } else {
          console.log('useSimpleAuth - No existing session');
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('useSimpleAuth - Error initializing auth:', error);
        setState(prev => ({ ...prev, loading: false, error: 'Error al inicializar autenticación' }));
      }
    };

    initializeAuth();

    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useSimpleAuth - Auth state change:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          clearState();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserData, clearState]);

  return {
    ...state,
    signIn,
    signOut,
    refreshData: () => state.user && loadUserData(state.user.id)
  };
};

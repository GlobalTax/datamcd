
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee } from '@/types/auth';
import { Session } from '@supabase/supabase-js';

interface RealAuthState {
  user: User | null;
  franchisee: Franchisee | null;
  restaurants: any[];
  loading: boolean;
  error: string | null;
  session: Session | null;
}

interface RealAuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useRealAuth = (): RealAuthState & RealAuthActions => {
  const [user, setUser] = useState<User | null>(null);
  const [franchisee, setFranchisee] = useState<Franchisee | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Cargar datos del usuario (separado de restaurantes)
  const loadUserProfile = useCallback(async (userId: string): Promise<{ userData: User | null, franchiseeData: Franchisee | null }> => {
    try {
      console.log('loadUserProfile - Loading profile for user:', userId);
      
      // Cargar perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error(`Error cargando perfil: ${profileError.message}`);
      }

      // Validar que el rol sea uno de los tipos permitidos
      const validRoles = ['franchisee', 'asesor', 'admin', 'superadmin', 'manager', 'asistente'];
      const userRole = validRoles.includes(profile.role) ? profile.role : 'franchisee';

      const userData: User = {
        id: profile.id,
        email: profile.email,
        role: userRole as User['role'],
        full_name: profile.full_name,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      let franchiseeData: Franchisee | null = null;

      // Si es franchisee, cargar datos del franquiciado
      if (userRole === 'franchisee') {
        try {
          const { data: franchiseeResult, error: franchiseeError } = await supabase
            .from('franchisees')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (!franchiseeError && franchiseeResult) {
            franchiseeData = franchiseeResult;
            console.log('loadUserProfile - Franchisee data loaded:', franchiseeData.franchisee_name);
          } else {
            console.warn('No franchisee data found for user:', userId);
          }
        } catch (error) {
          console.warn('Error loading franchisee data:', error);
        }
      }

      return { userData, franchiseeData };
    } catch (error) {
      console.error('loadUserProfile - Error:', error);
      throw error;
    }
  }, []);

  // Cargar restaurantes (separado e independiente)
  const loadRestaurants = useCallback(async (franchiseeId: string) => {
    try {
      console.log('loadRestaurants - Loading restaurants for franchisee:', franchiseeId);
      
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('franchisee_restaurants')
        .select(`
          id,
          monthly_rent,
          last_year_revenue,
          status,
          franchise_end_date,
          lease_end_date,
          base_restaurant_id
        `)
        .eq('franchisee_id', franchiseeId)
        .eq('status', 'active');

      if (restaurantsError) {
        console.warn('Error loading restaurants:', restaurantsError);
        return [];
      }

      // Para cada restaurante, cargar datos básicos del base_restaurant
      const restaurantsWithDetails = await Promise.all(
        (restaurantsData || []).map(async (restaurant) => {
          if (restaurant.base_restaurant_id) {
            try {
              const { data: baseRestaurant } = await supabase
                .from('base_restaurants')
                .select('id, site_number, restaurant_name, address, city, restaurant_type')
                .eq('id', restaurant.base_restaurant_id)
                .single();

              return {
                ...restaurant,
                base_restaurant: baseRestaurant
              };
            } catch (error) {
              console.warn('Error loading base restaurant for:', restaurant.base_restaurant_id);
              return restaurant;
            }
          }
          return restaurant;
        })
      );

      console.log('loadRestaurants - Loaded restaurants:', restaurantsWithDetails.length);
      return restaurantsWithDetails;
    } catch (error) {
      console.error('loadRestaurants - Error:', error);
      return [];
    }
  }, []);

  // Limpiar estado
  const clearAuthState = useCallback(() => {
    setUser(null);
    setFranchisee(null);
    setRestaurants([]);
    setSession(null);
    setError(null);
  }, []);

  // Cargar todos los datos del usuario
  const loadUserData = useCallback(async (userId: string) => {
    try {
      console.log('loadUserData - Starting for user:', userId);
      setError(null);
      
      // Cargar perfil y franquiciado
      const { userData, franchiseeData } = await loadUserProfile(userId);
      
      if (userData) {
        setUser(userData);
        console.log('loadUserData - User set:', userData.email);
      }

      if (franchiseeData) {
        setFranchisee(franchiseeData);
        console.log('loadUserData - Franchisee set:', franchiseeData.franchisee_name);
        
        // Cargar restaurantes de forma independiente
        try {
          const restaurantsData = await loadRestaurants(franchiseeData.id);
          setRestaurants(restaurantsData);
          console.log('loadUserData - Restaurants set:', restaurantsData.length);
        } catch (error) {
          console.warn('loadUserData - Failed to load restaurants, continuing without them:', error);
          setRestaurants([]);
        }
      }

      console.log('loadUserData - Completed successfully');
    } catch (error) {
      console.error('loadUserData - Error:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      // No limpiar estado aquí, mantener lo que se pudo cargar
    }
  }, [loadUserProfile, loadRestaurants]);

  // Inicializar autenticación
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('initializeAuth - Starting');
      
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn('initializeAuth - Session error:', sessionError);
        // No throw aquí, continuar sin sesión
      }

      if (currentSession?.user) {
        console.log('initializeAuth - Session found for user:', currentSession.user.id);
        setSession(currentSession);
        await loadUserData(currentSession.user.id);
      } else {
        console.log('initializeAuth - No session found');
        clearAuthState();
      }
    } catch (error) {
      console.error('initializeAuth - Error:', error);
      setError(error instanceof Error ? error.message : 'Error de inicialización');
      clearAuthState();
    } finally {
      setLoading(false);
      console.log('initializeAuth - Completed');
    }
  }, [loadUserData, clearAuthState]);

  // Acciones de autenticación
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
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
      setError(null);
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
      await supabase.auth.signOut();
    } catch (error) {
      console.error('signOut - Error:', error);
    }
  }, [clearAuthState]);

  const refreshData = useCallback(async () => {
    if (session?.user) {
      await loadUserData(session.user.id);
    }
  }, [session, loadUserData]);

  // Efecto principal
  useEffect(() => {
    console.log('useRealAuth - Initializing');
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('useRealAuth - Auth state change:', event);
        
        if (event === 'SIGNED_OUT') {
          clearAuthState();
        } else if (event === 'SIGNED_IN' && newSession?.user) {
          setSession(newSession);
          try {
            await loadUserData(newSession.user.id);
          } catch (error) {
            console.error('Error loading user data after sign in:', error);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initializeAuth, clearAuthState, loadUserData]);

  return {
    user,
    franchisee,
    restaurants,
    loading,
    error,
    session,
    signIn,
    signUp,
    signOut,
    refreshData
  };
};

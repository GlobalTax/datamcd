
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

  // Cargar datos del usuario
  const loadUserData = useCallback(async (userId: string) => {
    try {
      console.log('loadUserData - Loading real data for user:', userId);
      
      // Cargar perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
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

      setUser(userData);

      // Si es franchisee, cargar datos del franquiciado
      if (userRole === 'franchisee') {
        const { data: franchiseeData, error: franchiseeError } = await supabase
          .from('franchisees')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (franchiseeError) {
          console.warn('No franchisee data found for user:', userId);
          return;
        }

        setFranchisee(franchiseeData);

        // Cargar restaurantes del franquiciado
        const { data: restaurantsData, error: restaurantsError } = await supabase
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
          .eq('status', 'active');

        if (restaurantsError) {
          console.warn('Error loading restaurants:', restaurantsError);
        } else {
          setRestaurants(restaurantsData || []);
        }
      }

      console.log('loadUserData - Real data loaded successfully');
    } catch (error) {
      console.error('loadUserData - Error:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
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

  // Inicializar autenticación
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Error de sesión: ${sessionError.message}`);
      }

      if (currentSession?.user) {
        setSession(currentSession);
        await loadUserData(currentSession.user.id);
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error('initializeAuth - Error:', error);
      setError(error instanceof Error ? error.message : 'Error de inicialización');
      clearAuthState();
    } finally {
      setLoading(false);
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
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event);
        
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

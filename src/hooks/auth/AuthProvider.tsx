
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Tipos consolidados - Simplificado para superadmin
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string; // Agregado temporalmente para compatibilidad
}

interface Franchisee {
  id: string;
  user_id: string;
  franchisee_name: string;
  company_name?: string;
  total_restaurants?: number;
  created_at: string;
  updated_at: string;
  biloop_company_id?: string;
}

interface Restaurant {
  id: string;
  franchisee_id: string;
  base_restaurant_id: string;
  status: string;
  franchise_start_date?: string;
  franchise_end_date?: string;
  last_year_revenue?: number;
  monthly_rent?: number;
  base_restaurant?: {
    id: string;
    restaurant_name: string;
    site_number: string;
    address: string;
    city: string;
    [key: string]: any;
  };
  restaurant_name?: string;
  site_number?: string;
}

// Contexto principal consolidado
interface AuthContextType {
  // Estados de autenticación
  user: UserProfile | null;
  session: Session | null;
  franchisee: Franchisee | null;
  restaurants: Restaurant[];
  loading: boolean;
  connectionStatus?: 'online' | 'offline' | 'reconnecting';
  
  // Acciones de autenticación
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  
  // Compatibilidad temporal
  effectiveFranchisee: Franchisee | null;
  isImpersonating: boolean;
  
  // Utilidades
  refetchUserData: () => Promise<void>;
  getDebugInfo?: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook principal
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Debounce utility para evitar llamadas rápidas consecutivas
const useDebounce = (callback: (...args: any[]) => Promise<void>, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Provider consolidado  
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados principales
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [franchisee, setFranchisee] = useState<Franchisee | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Referencias para control de estado
  const authInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const isInitializing = useRef(false);

  // Función para cargar datos del usuario con manejo de errores mejorado
  const fetchUserData = useCallback(async (userId: string, retryCount = 0) => {
    // Evitar múltiples llamadas simultáneas
    if (isInitializing.current) {
      return;
    }
    
    isInitializing.current = true;
    
    try {
      // Cargar perfil del usuario con timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      );

      let profile;
      try {
        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;

        if (profileError) {
          // Fallback con datos de sesión
          const sessionUser = session?.user;
          profile = {
            id: userId,
            email: sessionUser?.email || 'usuario@ejemplo.com',
            full_name: sessionUser?.user_metadata?.full_name || 'Usuario'
          };
        } else {
          profile = profileData;
        }
      } catch (error) {
        const sessionUser = session?.user;
        profile = {
          id: userId,
          email: sessionUser?.email || 'usuario@ejemplo.com',
          full_name: sessionUser?.user_metadata?.full_name || 'Usuario'
        };
      }

      setUser({ ...profile, role: 'superadmin' }); // Agregar role temporal

      // Cargar franquiciado para todos los usuarios
      try {
        const { data: franchiseeData, error: franchiseeError } = await supabase
          .from('franchisees')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (franchiseeError) {
          await createFranchisee(userId);
        } else {
          setFranchisee(franchiseeData);
          
          // Cargar restaurantes del franquiciado
          await fetchRestaurants(franchiseeData.id);
        }
      } catch (franchiseeError) {
        await createFranchisee(userId);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Retry logic para errores temporales
      if (retryCount < 2) {
        setTimeout(() => {
          fetchUserData(userId, retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }
      
      // Fallback con datos mínimos funcionales después de todos los reintentos
      const fallbackProfile: UserProfile = {
        id: userId,
        email: session?.user?.email || 'usuario@ejemplo.com',
        full_name: session?.user?.user_metadata?.full_name || 'Usuario',
        role: 'superadmin'
      };
      setUser({ ...fallbackProfile, role: 'superadmin' });
      
      // Intentar crear franquiciado
      await createFranchisee(userId);
    } finally {
      isInitializing.current = false;
    }
  }, [session]);

  // Versión con debounce para evitar llamadas rápidas
  const debouncedFetchUserData = useDebounce(fetchUserData, 300);

  // Crear franquiciado si no existe
  const createFranchisee = useCallback(async (userId: string) => {
    try {
      const { data: newFranchisee, error } = await supabase
        .from('franchisees')
        .insert({
          user_id: userId,
          franchisee_name: session?.user?.user_metadata?.full_name || 'Nuevo Franquiciado',
          company_name: 'Mi Empresa',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating franchisee:', error);
        // Crear franquiciado fallback local
        const fallbackFranchisee: Franchisee = {
          id: `temp-${userId}`,
          user_id: userId,
          franchisee_name: 'Nuevo Franquiciado',
          company_name: 'Mi Empresa',
          total_restaurants: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setFranchisee(fallbackFranchisee);
      } else {
        setFranchisee(newFranchisee);
      }
    } catch (error) {
      console.error('Unexpected error creating franchisee:', error);
    }
  }, [session]);

  // Cargar restaurantes del franquiciado
  const fetchRestaurants = useCallback(async (franchiseeId: string) => {
    try {
      // Skip para IDs temporales
      if (franchiseeId.startsWith('temp-')) {
        setRestaurants([]);
        return;
      }

      const { data: restaurantData, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants(*)
        `)
        .eq('franchisee_id', franchiseeId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching restaurants:', error);
        setRestaurants([]);
      } else {
        setRestaurants(restaurantData || []);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
    }
  }, []);

  // Inicialización del sistema de autenticación
  useEffect(() => {
    if (authInitialized.current) return;
    
    authInitialized.current = true;
    
    let authSubscription: any = null;
    
    // Función para manejar cambios de estado de autenticación
    const handleAuthStateChange = async (event: string, newSession: Session | null) => {
      // Sincronizar el estado de sesión primero
      setSession(newSession);
      
      if (newSession?.user && currentUserId.current !== newSession.user.id) {
        currentUserId.current = newSession.user.id;
        // Usar la versión con debounce para evitar llamadas rápidas
        debouncedFetchUserData(newSession.user.id);
      } else if (!newSession?.user) {
        currentUserId.current = null;
        setUser(null);
        setFranchisee(null);
        setRestaurants([]);
        setLoading(false);
      }
    };

    // Configurar listener de cambios de estado
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
      authSubscription = subscription;
      return subscription;
    };

    // Verificar sesión inicial
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          await handleAuthStateChange('INITIAL_SESSION', initialSession);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in initialization:', error);
        setLoading(false);
      }
    };

    // Configurar listener primero, luego verificar sesión inicial
    setupAuthListener();
    initializeAuth();

    // Cleanup
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [debouncedFetchUserData]);

  // Efecto separado para manejar el loading después de fetch de datos
  useEffect(() => {
    if (user !== null || (!session && !loading)) {
      setLoading(false);
    }
  }, [user, session, loading]);

  // Acciones de autenticación
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
        return { error: error.message };
      }
      
      toast.success('Sesión iniciada correctamente');
      return {};
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      toast.error('Error inesperado al iniciar sesión');
      return { error: 'Error inesperado al iniciar sesión' };
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
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message);
        return { error: error.message };
      }
      
      toast.success('Cuenta creada. Revisa tu email para confirmar.');
      return {};
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      toast.error('Error inesperado al registrarse');
      return { error: 'Error inesperado al registrarse' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('Session not found')) {
        console.error('Sign out error:', error);
        toast.error(error.message);
      } else {
        toast.success('Sesión cerrada correctamente');
      }
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
      toast.error('Error al cerrar sesión');
    }
  }, []);

  // Refetch manual de datos
  const refetchUserData = useCallback(async () => {
    if (currentUserId.current) {
      await fetchUserData(currentUserId.current);
    }
  }, [fetchUserData]);

  const getDebugInfo = useCallback(() => ({
    user: user ? { id: user.id, email: user.email } : null,
    session: session ? { access_token: session.access_token ? 'present' : 'missing' } : null,
    franchisee: franchisee ? { id: franchisee.id, name: franchisee.franchisee_name } : null,
    loading,
    authInitialized: !!session,
    sessionExists: !!session?.access_token
  }), [user, session, franchisee, loading]);

  const value: AuthContextType = {
    // Estados principales
    user,
    session,
    franchisee,
    restaurants,
    loading,
    connectionStatus: 'online',
    
    // Acciones
    signIn,
    signUp,
    signOut,
    
    // Compatibilidad temporal
    effectiveFranchisee: franchisee,
    isImpersonating: false,
    
    // Utilidades
    refetchUserData,
    getDebugInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export legacy hooks para mantener compatibilidad
export const useUnifiedAuth = useAuth;


import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Tipos consolidados
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface Franchisee {
  id: string;
  user_id: string;
  franchisee_name: string;
  company_name?: string;
  total_restaurants?: number;
  created_at: string;
  updated_at: string;
}

interface Restaurant {
  id: string;
  franchisee_id: string;
  base_restaurant_id: string;
  status: string;
  // Campos adicionales de franchisee_restaurants
  franchise_start_date?: string;
  franchise_end_date?: string;
  last_year_revenue?: number;
  monthly_rent?: number;
  // Relación con base_restaurant
  base_restaurant?: {
    id: string;
    restaurant_name: string;
    site_number: string;
    address: string;
    city: string;
    [key: string]: any;
  };
  // Alias para compatibilidad
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
  connectionStatus: 'online' | 'offline' | 'reconnecting';
  
  // Estados de impersonación (solo para asesores)
  isImpersonating: boolean;
  impersonatedFranchisee: Franchisee | null;
  effectiveFranchisee: Franchisee | null;
  
  // Acciones de autenticación
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  
  // Acciones de impersonación
  startImpersonation: (franchisee: Franchisee) => void;
  stopImpersonation: () => void;
  
  // Utilidades
  refetchUserData: () => Promise<void>;
  getDebugInfo: () => any;
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
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'reconnecting'>('online');
  
  // Estados de impersonación
  const [impersonatedFranchisee, setImpersonatedFranchisee] = useState<Franchisee | null>(null);
  
  // Referencias para control de estado - CORREGIDO: No resetear en cleanup
  const authInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const isInitializing = useRef(false);

  // Franquiciado efectivo (impersonado o real)
  const effectiveFranchisee = impersonatedFranchisee || franchisee;
  const isImpersonating = Boolean(impersonatedFranchisee);

  // Cargar estado de impersonación persistente
  useEffect(() => {
    const savedImpersonation = sessionStorage.getItem('impersonatedFranchisee');
    if (savedImpersonation) {
      try {
        const savedFranchisee = JSON.parse(savedImpersonation);
        setImpersonatedFranchisee(savedFranchisee);
        console.log('AUTH: Restored impersonation state');
      } catch (error) {
        console.error('AUTH: Error restoring impersonation:', error);
        sessionStorage.removeItem('impersonatedFranchisee');
      }
    }
  }, []);

  // Función para cargar datos del usuario con manejo de errores mejorado
  const fetchUserData = useCallback(async (userId: string, retryCount = 0) => {
    // Evitar múltiples llamadas simultáneas
    if (isInitializing.current) {
      console.log('AUTH: Already initializing, skipping fetchUserData');
      return;
    }
    
    isInitializing.current = true;
    
    try {
      console.log('AUTH: Fetching user data for:', userId, 'Retry:', retryCount);
      
      // Cargar perfil del usuario con timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      let profile;
      try {
        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;

        if (profileError) {
          console.log('AUTH: Profile not found, using session data');
          // Fallback con datos de sesión
          const sessionUser = session?.user;
          profile = {
            id: userId,
            email: sessionUser?.email || 'usuario@ejemplo.com',
            full_name: sessionUser?.user_metadata?.full_name || 'Usuario',
            role: 'franchisee'
          };
        } else {
          profile = profileData;
        }
      } catch (error) {
        console.log('AUTH: Profile fetch failed, using fallback');
        const sessionUser = session?.user;
        profile = {
          id: userId,
          email: sessionUser?.email || 'usuario@ejemplo.com',
          full_name: sessionUser?.user_metadata?.full_name || 'Usuario',
          role: 'franchisee'
        };
      }

      setUser(profile);

      // Cargar franquiciado solo para usuarios franchisee
      if (!profile || profile.role === 'franchisee') {
        try {
          const { data: franchiseeData, error: franchiseeError } = await supabase
            .from('franchisees')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (franchiseeError) {
            console.log('AUTH: Creating new franchisee');
            await createFranchisee(userId);
          } else {
            setFranchisee(franchiseeData);
            
            // Cargar restaurantes del franquiciado
            await fetchRestaurants(franchiseeData.id);
          }
        } catch (franchiseeError) {
          console.log('AUTH: Franchisee fetch failed, creating new one');
          await createFranchisee(userId);
        }
      }

      console.log('AUTH: User data loaded successfully');
    } catch (error) {
      console.error('AUTH: Error fetching user data:', error);
      
      // Retry logic para errores temporales
      if (retryCount < 2) {
        console.log('AUTH: Retrying fetchUserData, attempt:', retryCount + 1);
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
        role: 'franchisee'
      };
      setUser(fallbackProfile);
      
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
        console.error('AUTH: Error creating franchisee:', error);
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
      console.error('AUTH: Unexpected error creating franchisee:', error);
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
        console.error('AUTH: Error fetching restaurants:', error);
        setRestaurants([]);
      } else {
        setRestaurants(restaurantData || []);
        console.log('AUTH: Restaurants loaded:', restaurantData?.length || 0);
      }
    } catch (error) {
      console.error('AUTH: Error fetching restaurants:', error);
      setRestaurants([]);
    }
  }, []);

  // Inicialización del sistema de autenticación - CORREGIDO
  useEffect(() => {
    if (authInitialized.current) return;
    
    console.log('AUTH: Initializing authentication system');
    authInitialized.current = true;
    
    let authSubscription: any = null;
    
    // Función para manejar cambios de estado de autenticación
    const handleAuthStateChange = async (event: string, newSession: Session | null) => {
      console.log('AUTH: State change:', event, newSession?.user?.id);
      
      // Sincronizar el estado de sesión primero
      setSession(newSession);
      
      if (newSession?.user && currentUserId.current !== newSession.user.id) {
        currentUserId.current = newSession.user.id;
        // Usar la versión con debounce para evitar llamadas rápidas
        debouncedFetchUserData(newSession.user.id);
      } else if (!newSession?.user) {
        console.log('AUTH: Clearing user data');
        currentUserId.current = null;
        setUser(null);
        setFranchisee(null);
        setRestaurants([]);
        // Limpiar impersonación al cerrar sesión
        setImpersonatedFranchisee(null);
        sessionStorage.removeItem('impersonatedFranchisee');
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
        console.log('AUTH: Initial session check:', initialSession?.user?.id);
        
        if (initialSession) {
          await handleAuthStateChange('INITIAL_SESSION', initialSession);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('AUTH: Error in initialization:', error);
        setLoading(false);
      }
    };

    // Configurar listener primero, luego verificar sesión inicial
    setupAuthListener();
    initializeAuth();

    // Cleanup - CORREGIDO: No resetear authInitialized
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      // NO resetear authInitialized.current = false; para mantener patrón singleton
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
        console.error('AUTH: Sign in error:', error);
        toast.error(error.message);
        return { error: error.message };
      }
      
      toast.success('Sesión iniciada correctamente');
      return {};
    } catch (error: any) {
      console.error('AUTH: Unexpected sign in error:', error);
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
        console.error('AUTH: Sign up error:', error);
        toast.error(error.message);
        return { error: error.message };
      }
      
      toast.success('Cuenta creada. Revisa tu email para confirmar.');
      return {};
    } catch (error: any) {
      console.error('AUTH: Unexpected sign up error:', error);
      toast.error('Error inesperado al registrarse');
      return { error: 'Error inesperado al registrarse' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Limpiar impersonación
      if (isImpersonating) {
        setImpersonatedFranchisee(null);
        sessionStorage.removeItem('impersonatedFranchisee');
      }
      
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('Session not found')) {
        console.error('AUTH: Sign out error:', error);
        toast.error(error.message);
      } else {
        toast.success('Sesión cerrada correctamente');
      }
    } catch (error: any) {
      console.error('AUTH: Unexpected sign out error:', error);
      toast.error('Error al cerrar sesión');
    }
  }, [isImpersonating]);

  // Acciones de impersonación
  const startImpersonation = useCallback((franchisee: Franchisee) => {
    console.log('AUTH: Starting impersonation:', franchisee.franchisee_name);
    setImpersonatedFranchisee(franchisee);
    sessionStorage.setItem('impersonatedFranchisee', JSON.stringify(franchisee));
    toast.success(`Impersonando a ${franchisee.franchisee_name}`);
  }, []);

  const stopImpersonation = useCallback(() => {
    console.log('AUTH: Stopping impersonation');
    setImpersonatedFranchisee(null);
    sessionStorage.removeItem('impersonatedFranchisee');
    toast.success('Impersonación terminada');
  }, []);

  // Refetch manual de datos
  const refetchUserData = useCallback(async () => {
    if (currentUserId.current) {
      await fetchUserData(currentUserId.current);
    }
  }, [fetchUserData]);

  // Información de debugging
  const getDebugInfo = useCallback(() => {
    return {
      user: user ? { id: user.id, role: user.role, email: user.email } : null,
      session: !!session,
      loading,
      franchisee: franchisee ? { id: franchisee.id, name: franchisee.franchisee_name } : null,
      restaurants: restaurants.length,
      impersonation: {
        isImpersonating,
        impersonatedFranchisee: impersonatedFranchisee?.franchisee_name || null
      },
      initialized: authInitialized.current,
      isInitializing: isInitializing.current,
      timestamp: new Date().toISOString()
    };
  }, [user, session, loading, franchisee, restaurants, isImpersonating, impersonatedFranchisee]);

  const value: AuthContextType = {
    // Estados principales
    user,
    session,
    franchisee,
    restaurants,
    loading,
    connectionStatus,
    
    // Impersonación
    isImpersonating,
    impersonatedFranchisee,
    effectiveFranchisee,
    
    // Acciones
    signIn,
    signUp,
    signOut,
    startImpersonation,
    stopImpersonation,
    
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

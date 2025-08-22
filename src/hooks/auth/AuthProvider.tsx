
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { FirstLoginModal } from '@/components/auth/FirstLoginModal';
import { useRateLimiting } from '@/hooks/useRateLimiting';

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
  console.log('🔍 useAuth called - checking context...');
  const context = useContext(AuthContext);
  console.log('🔍 useAuth context:', context ? 'EXISTS' : 'UNDEFINED');
  if (context === undefined) {
    console.error('❌ useAuth: AuthContext is undefined - no AuthProvider found!');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  console.log('✅ useAuth: Context found, returning:', context.user ? 'USER_FOUND' : 'NO_USER');
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
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  
  // Security enhancements
  const { checkAuthRateLimit } = useRateLimiting();
  
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
            full_name: sessionUser?.user_metadata?.full_name || 'Usuario',
            role: 'franchisee' // Default role
          };
        } else {
          profile = profileData;
        }
      } catch (error) {
        const sessionUser = session?.user;
        profile = {
          id: userId,
          email: sessionUser?.email || 'usuario@ejemplo.com',
          full_name: sessionUser?.user_metadata?.full_name || 'Usuario',
          role: 'franchisee' // Default role
        };
      }

      setUser(profile);
      
      console.log('🔍 AuthProvider - User loaded:', {
        userId,
        role: profile.role,
        email: profile.email,
        isAdmin: profile.role === 'superadmin' || profile.role === 'admin'
      });

      // Verificar si debe cambiar contraseña usando la nueva función de BD
      const { data: mustChangePasswordData } = await supabase
        .rpc('user_must_change_password', { user_uuid: userId });
      
      if (mustChangePasswordData) {
        setShowFirstLoginModal(true);
      }

      // Solo cargar franquiciado para usuarios que no son superadmin/admin
      if (profile.role !== 'superadmin' && profile.role !== 'admin') {
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
      }
    } catch (error) {
      logger.authError('Failed to fetch user data', { userId, retryCount }, error as Error);
      
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
        role: 'franchisee' // Default role
      };
      setUser(fallbackProfile);
      
      // Solo intentar crear franquiciado si no es superadmin/admin
      if (fallbackProfile.role !== 'superadmin' && fallbackProfile.role !== 'admin') {
        await createFranchisee(userId);
      }
    } finally {
      isInitializing.current = false;
    }
  }, [session]);

  // Versión con debounce para evitar llamadas rápidas
  const debouncedFetchUserData = useDebounce(fetchUserData, 300);

  // Crear franquiciado si no existe (solo para usuarios que no son admin/superadmin)
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
        logger.dataError('Failed to create franchisee', 'franchisees', 'insert', { userId }, error);
        // Para usuarios normales, crear franquiciado fallback local
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
      logger.error('Unexpected error creating franchisee', { userId }, error as Error);
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
        logger.dataError('Failed to fetch restaurants', 'franchisee_restaurants', 'select', { franchiseeId }, error);
        setRestaurants([]);
      } else {
        setRestaurants(restaurantData || []);
      }
    } catch (error) {
      logger.error('Unexpected error fetching restaurants', { franchiseeId }, error as Error);
      setRestaurants([]);
    }
  }, []);

  // Función para limpiar completamente el storage de auth
  const clearAuthStorage = useCallback(() => {
    try {
      // Limpiar todas las claves relacionadas con Supabase auth
      const keys = ['supabase.auth.token', 'sb-ckvqfrppnfhoadcpqhld-auth-token'];
      keys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Limpiar cualquier clave que empiece con 'sb-'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      logger.error('Error clearing auth storage', {}, error as Error);
    }
  }, []);

  // Inicialización del sistema de autenticación
  useEffect(() => {
    if (authInitialized.current) return;
    
    authInitialized.current = true;
    
    let authSubscription: any = null;
    
    // Función para manejar cambios de estado de autenticación
    const handleAuthStateChange = async (event: string, newSession: Session | null) => {
      // Si hay error de token refresh, limpiar sesión local
      if (event === 'TOKEN_REFRESHED' && !newSession) {
        clearAuthStorage();
        await supabase.auth.signOut();
        return;
      }
      
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

    // Verificar sesión inicial con manejo de errores de token
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        // Si hay error de token refresh, limpiar todo
        if (error && (error.message.includes('refresh') || error.message.includes('token'))) {
          clearAuthStorage();
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        if (initialSession) {
          await handleAuthStateChange('INITIAL_SESSION', initialSession);
        } else {
          setLoading(false);
        }
      } catch (error: any) {
        logger.authError('Failed to initialize authentication', {}, error);
        
        // Si es error de token refresh, limpiar sesión completamente
        if (error.message?.includes('refresh') || error.message?.includes('token') || error.message?.includes('Invalid')) {
          clearAuthStorage();
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            // Ignorar errores de signOut si ya hay problemas de sesión
          }
        }
        
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
  }, [debouncedFetchUserData, clearAuthStorage]);

  // Efecto separado para manejar el loading después de fetch de datos
  useEffect(() => {
    if (user !== null || (!session && !loading)) {
      setLoading(false);
    }
  }, [user, session, loading]);

  // Acciones de autenticación
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Check rate limiting before attempting authentication
      const rateLimitAllowed = await checkAuthRateLimit(email);
      if (!rateLimitAllowed) {
        const message = 'Demasiados intentos de inicio de sesión. Por favor, espera antes de intentar de nuevo.';
        toast.error(message);
        return { error: message };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        logger.authError('Sign in failed', { email }, error);
        toast.error(error.message);
        return { error: error.message };
      }
      
      toast.success('Sesión iniciada correctamente');
      return {};
    } catch (error: any) {
      logger.authError('Unexpected sign in error', { email }, error);
      toast.error('Error inesperado al iniciar sesión');
      return { error: 'Error inesperado al iniciar sesión' };
    }
  }, [checkAuthRateLimit]);

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
        logger.authError('Sign up failed', { email }, error);
        toast.error(error.message);
        return { error: error.message };
      }
      
      toast.success('Cuenta creada. Revisa tu email para confirmar.');
      return {};
    } catch (error: any) {
      logger.authError('Unexpected sign up error', { email }, error);
      toast.error('Error inesperado al registrarse');
      return { error: 'Error inesperado al registrarse' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('Session not found')) {
        logger.authError('Sign out failed', {}, error);
        toast.error(error.message);
      } else {
        toast.success('Sesión cerrada correctamente');
      }
    } catch (error: any) {
      logger.authError('Unexpected sign out error', {}, error);
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

  // Manejar completar el cambio de contraseña del primer login
  const handleFirstLoginComplete = useCallback(async () => {
    if (user?.id) {
      // Marcar contraseña como cambiada en la BD
      await supabase.rpc('mark_password_changed', { user_uuid: user.id });
    }
    setShowFirstLoginModal(false);
    toast.success('¡Bienvenido! Configuración completada correctamente');
  }, [user]);

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
      
      {/* Modal de primer login */}
      {showFirstLoginModal && user && (
        <FirstLoginModal
          isOpen={showFirstLoginModal}
          userEmail={user.email}
          onPasswordChanged={handleFirstLoginComplete}
        />
      )}
    </AuthContext.Provider>
  );
};

// Export legacy hooks para mantener compatibilidad
// Re-export for backward compatibility
export const useUnifiedAuth = useAuth;

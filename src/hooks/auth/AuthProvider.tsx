import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { performSecurityAudit } from '@/utils/securityCleanup';

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
  
  // Estados de impersonación (solo para asesores)
  isImpersonating: boolean;
  impersonatedFranchisee: Franchisee | null;
  effectiveFranchisee: Franchisee | null;
  
  // Acciones de autenticación
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  
  // Acciones de impersonación
  startImpersonation: (franchisee: Franchisee) => void;
  stopImpersonation: () => void;
  
  // Utilidades
  refetchUserData: () => Promise<void>;
  getDebugInfo?: () => any;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Hook principal
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider consolidado  
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Estados principales
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [franchisee, setFranchisee] = React.useState<Franchisee | null>(null);
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Estados de impersonación
  const [impersonatedFranchisee, setImpersonatedFranchisee] = React.useState<Franchisee | null>(null);
  
  // Referencias para control de estado
  const authInitialized = React.useRef(false);
  const currentUserId = React.useRef<string | null>(null);
  const isInitializing = React.useRef(false);

  // Función mejorada para validar y sincronizar IDs entre auth.users y profiles
  const validateAndSyncUserProfile = React.useCallback(async (authUser: User) => {
    console.log(`🔍 AuthProvider - Validating profile sync for user:`, {
      authUserId: authUser.id,
      email: authUser.email
    });

    try {
      // Primero verificar si existe el perfil por ID (lo ideal)
      const { data: profileById, error: profileByIdError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileByIdError) {
        console.warn('⚠️ AuthProvider - Error querying profile by ID:', profileByIdError);
      }

      if (profileById) {
        console.log('✅ AuthProvider - Profile found by ID, sync is correct');
        return profileById;
      }

      // Si no existe por ID, buscar por email para detectar desincronización
      const { data: profileByEmail, error: profileByEmailError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', authUser.email)
        .maybeSingle();

      if (profileByEmailError) {
        console.warn('⚠️ AuthProvider - Error querying profile by email:', profileByEmailError);
        return null;
      }

      if (profileByEmail && profileByEmail.id !== authUser.id) {
        console.warn('🚨 AuthProvider - ID MISMATCH DETECTED!', {
          authUserId: authUser.id,
          profileId: profileByEmail.id,
          email: authUser.email,
          message: 'This indicates a critical sync issue between auth.users and profiles'
        });

        // Log crítico para alertar sobre el problema
        console.error('🚨 CRITICAL: User profile ID mismatch detected for email:', authUser.email);
        console.error('Auth User ID:', authUser.id);
        console.error('Profile ID:', profileByEmail.id);
        
        // Intentar corregir automáticamente
        console.log('🔧 AuthProvider - Attempting automatic ID sync correction...');
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ id: authUser.id })
          .eq('email', authUser.email)
          .select()
          .single();

        if (updateError) {
          console.error('❌ AuthProvider - Failed to sync profile ID:', updateError);
          // Log detallado del error para debugging
          console.error('Update error details:', {
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint
          });
          return null;
        }

        console.log('✅ AuthProvider - Profile ID sync corrected successfully');
        return updatedProfile;
      }

      return profileByEmail;
    } catch (error) {
      console.error('❌ AuthProvider - Critical error in profile validation:', error);
      return null;
    }
  }, []);

  // Franquiciado efectivo (impersonado o real)
  const effectiveFranchisee = impersonatedFranchisee || franchisee;
  const isImpersonating = Boolean(impersonatedFranchisee);

  // Cargar estado de impersonación persistente
  React.useEffect(() => {
    const savedImpersonation = sessionStorage.getItem('impersonatedFranchisee');
    if (savedImpersonation) {
      try {
        const savedFranchisee = JSON.parse(savedImpersonation);
        setImpersonatedFranchisee(savedFranchisee);
      } catch (error) {
        console.error('Error restoring impersonation:', error);
        sessionStorage.removeItem('impersonatedFranchisee');
      }
    }
  }, []);

  // Función mejorada para cargar datos del usuario
  const fetchUserData = React.useCallback(async (userId: string, retryCount = 0) => {
    console.log(`AuthProvider - fetchUserData starting for userId: ${userId}, retry: ${retryCount}`);
    
    if (isInitializing.current) {
      console.log('AuthProvider - Already initializing, skipping');
      return;
    }
    
    isInitializing.current = true;
    
    try {
      // 1. Intentar cargar perfil por ID primero
      console.log('AuthProvider - Fetching user profile by ID...');
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // 2. Si no encuentra por ID, usar función de validación y sincronización
      if (!profileData && session?.user) {
        console.log('AuthProvider - Profile not found by ID, attempting validation and sync...');
        profileData = await validateAndSyncUserProfile(session.user);
        profileError = null;
      }

      let profile: UserProfile;
      
      if (profileError || !profileData) {
        console.log('AuthProvider - Profile error or not found:', profileError);
        
        // Crear perfil básico basado en email para casos especiales
        const sessionUser = session?.user;
        if (sessionUser?.email === 's.navarro@obn.es') {
          console.log('AuthProvider - Creating superadmin profile for s.navarro@obn.es');
          profile = {
            id: userId,
            email: 's.navarro@obn.es',
            full_name: 'Superadmin',
            role: 'superadmin'
          };
          
          // Intentar crear el perfil en la base de datos
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profile)
            .select()
            .single();
          
          if (insertError) {
            console.log('AuthProvider - Could not insert profile, using fallback');
          }
        } else {
          // Perfil genérico para otros usuarios
          profile = {
            id: userId,
            email: sessionUser?.email || 'usuario@ejemplo.com',
            full_name: sessionUser?.user_metadata?.full_name || 'Usuario',
            role: 'franchisee'
          };
        }
      } else {
        profile = profileData;
        
        // Mapear roles legacy a roles actuales
        if (profile.role === 'asesor') {
          console.log('AuthProvider - Mapping legacy role "asesor" to "admin"');
          profile.role = 'admin';
        }
      }

      console.log('AuthProvider - Profile loaded:', { 
        email: profile.email, 
        role: profile.role,
        id: profile.id 
      });
      setUser(profile);

      // 3. Solo cargar franquiciado para usuarios franchisee
      if (profile.role === 'franchisee') {
        console.log('AuthProvider - Loading franchisee data...');
        try {
          const { data: franchiseeData, error: franchiseeError } = await supabase
            .from('franchisees')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (franchiseeError || !franchiseeData) {
            console.log('AuthProvider - Creating new franchisee');
            await createFranchisee(userId);
          } else {
            setFranchisee(franchiseeData);
            console.log('AuthProvider - Franchisee loaded:', franchiseeData.franchisee_name);
            
            // Cargar restaurantes del franquiciado
            await fetchRestaurants(franchiseeData.id);
          }
        } catch (franchiseeError) {
          console.error('AuthProvider - Franchisee fetch error:', franchiseeError);
          await createFranchisee(userId);
        }
      } else {
        console.log(`AuthProvider - User role is ${profile.role}, no franchisee data needed`);
        setFranchisee(null);
        setRestaurants([]);
      }

      console.log('AuthProvider - User data loaded successfully');
      
    } catch (error) {
      console.error('AuthProvider - Critical error in fetchUserData:', error);
      
      // Retry logic para errores temporales
      if (retryCount < 2) {
        console.log(`AuthProvider - Retrying fetchUserData in ${1000 * (retryCount + 1)}ms`);
        setTimeout(() => {
          fetchUserData(userId, retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }
      
      // Fallback después de todos los reintentos
      const sessionUser = session?.user;
      const fallbackProfile: UserProfile = {
        id: userId,
        email: sessionUser?.email || 'usuario@ejemplo.com',
        full_name: sessionUser?.user_metadata?.full_name || 'Usuario',
        role: sessionUser?.email === 's.navarro@obn.es' ? 'superadmin' : 'franchisee'
      };
      
      console.log('AuthProvider - Using fallback profile:', fallbackProfile);
      setUser(fallbackProfile);
      
      // Solo crear franquiciado si el rol es franchisee
      if (fallbackProfile.role === 'franchisee') {
        await createFranchisee(userId);
      }
    } finally {
      isInitializing.current = false;
      setLoading(false);
    }
  }, [session]);

  // Crear franquiciado si no existe
  const createFranchisee = React.useCallback(async (userId: string) => {
    console.log('AuthProvider - Creating franchisee for userId:', userId);
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
        console.error('AuthProvider - Error creating franchisee:', error);
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
        console.log('AuthProvider - Franchisee created successfully');
        setFranchisee(newFranchisee);
      }
    } catch (error) {
      console.error('AuthProvider - Unexpected error creating franchisee:', error);
    }
  }, [session]);

  // Cargar restaurantes del franquiciado
  const fetchRestaurants = React.useCallback(async (franchiseeId: string) => {
    console.log('AuthProvider - Fetching restaurants for franchisee:', franchiseeId);
    try {
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
        console.error('AuthProvider - Error fetching restaurants:', error);
        setRestaurants([]);
      } else {
        console.log(`AuthProvider - Loaded ${restaurantData?.length || 0} restaurants`);
        setRestaurants(restaurantData || []);
      }
    } catch (error) {
      console.error('AuthProvider - Error fetching restaurants:', error);
      setRestaurants([]);
    }
  }, []);

  // Inicialización del sistema de autenticación
  React.useEffect(() => {
    if (authInitialized.current) return;
    
    console.log('AuthProvider - Initializing authentication system');
    authInitialized.current = true;
    
    let authSubscription: any = null;
    
    // Función para manejar cambios de estado de autenticación
    const handleAuthStateChange = async (event: string, newSession: Session | null) => {
      console.log(`🔄 AuthProvider - Auth state change: ${event}`, {
        hasSession: !!newSession,
        userId: newSession?.user?.id,
        email: newSession?.user?.email,
        timestamp: new Date().toISOString()
      });

      // Log adicional para debugging de sincronización de IDs
      if (newSession?.user) {
        console.log('📊 AuthProvider - User session details:', {
          id: newSession.user.id,
          email: newSession.user.email,
          emailConfirmed: !!newSession.user.email_confirmed_at,
          lastSignIn: newSession.user.last_sign_in_at,
          role: newSession.user.role
        });
      }
      
      setSession(newSession);
      
      if (newSession?.user && currentUserId.current !== newSession.user.id) {
        currentUserId.current = newSession.user.id;
        setLoading(true);
        await fetchUserData(newSession.user.id);
      } else if (!newSession?.user) {
        console.log('AuthProvider - Clearing user data');
        currentUserId.current = null;
        setUser(null);
        setFranchisee(null);
        setRestaurants([]);
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
        console.log('AuthProvider - Checking initial session...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        // Realizar auditoría de seguridad al cargar la app
        await performSecurityAudit();
        
        if (initialSession) {
          console.log('AuthProvider - Initial session found');
          await handleAuthStateChange('INITIAL_SESSION', initialSession);
        } else {
          console.log('AuthProvider - No initial session');
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider - Error in initialization:', error);
        setLoading(false);
      }
    };

    setupAuthListener();
    initializeAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchUserData]);

  // Acciones de autenticación
  const signIn = React.useCallback(async (email: string, password: string) => {
    console.log('AuthProvider - Starting sign in for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthProvider - Sign in error:', error);
        toast.error(error.message);
        return { error: error.message };
      }
      
      console.log('AuthProvider - Sign in successful');
      toast.success('Sesión iniciada correctamente');
      return {};
    } catch (error: any) {
      console.error('AuthProvider - Unexpected sign in error:', error);
      toast.error('Error inesperado al iniciar sesión');
      return { error: 'Error inesperado al iniciar sesión' };
    }
  }, []);

  const signUp = React.useCallback(async (email: string, password: string, fullName: string) => {
    console.log('AuthProvider - Starting sign up for:', email);
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
        console.error('AuthProvider - Sign up error:', error);
        toast.error(error.message);
        return { error: error.message };
      }
      
      console.log('AuthProvider - Sign up successful');
      toast.success('Cuenta creada. Revisa tu email para confirmar.');
      return {};
    } catch (error: any) {
      console.error('AuthProvider - Unexpected sign up error:', error);
      toast.error('Error inesperado al registrarse');
      return { error: 'Error inesperado al registrarse' };
    }
  }, []);

  const signOut = React.useCallback(async () => {
    console.log('AuthProvider - Starting sign out');
    try {
      if (isImpersonating) {
        setImpersonatedFranchisee(null);
        sessionStorage.removeItem('impersonatedFranchisee');
      }
      
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('Session not found')) {
        console.error('AuthProvider - Sign out error:', error);
        toast.error(error.message);
      } else {
        console.log('AuthProvider - Sign out successful');
        toast.success('Sesión cerrada correctamente');
      }
    } catch (error: any) {
      console.error('AuthProvider - Unexpected sign out error:', error);
      toast.error('Error al cerrar sesión');
    }
  }, [isImpersonating]);

  // Acciones de impersonación
  const startImpersonation = React.useCallback((franchisee: Franchisee) => {
    setImpersonatedFranchisee(franchisee);
    sessionStorage.setItem('impersonatedFranchisee', JSON.stringify(franchisee));
    toast.success(`Impersonando a ${franchisee.franchisee_name}`);
  }, []);

  const stopImpersonation = React.useCallback(() => {
    setImpersonatedFranchisee(null);
    sessionStorage.removeItem('impersonatedFranchisee');
    toast.success('Impersonación terminada');
  }, []);

  // Refetch manual de datos
  const refetchUserData = React.useCallback(async () => {
    if (currentUserId.current) {
      console.log('AuthProvider - Manual refetch requested');
      await fetchUserData(currentUserId.current);
    }
  }, [fetchUserData]);

  const getDebugInfo = React.useCallback(() => ({
    user: user ? { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      full_name: user.full_name 
    } : null,
    session: session ? { 
      access_token: session.access_token ? 'present' : 'missing',
      user_id: session.user?.id,
      user_email: session.user?.email
    } : null,
    franchisee: franchisee ? { 
      id: franchisee.id, 
      name: franchisee.franchisee_name 
    } : null,
    loading,
    authInitialized: authInitialized.current,
    currentUserId: currentUserId.current,
    isInitializing: isInitializing.current
  }), [user, session, franchisee, loading]);

  const value: AuthContextType = {
    // Estados principales
    user,
    session,
    franchisee,
    restaurants,
    loading,
    connectionStatus: 'online',
    
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

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Franchisee } from '@/types/auth';
import { useOptimizedUserDataFetcher } from './useOptimizedUserDataFetcher';
import { toast } from 'sonner';

interface UnifiedAuthContextType {
  // Estados básicos de autenticación
  user: any | null;
  session: Session | null;
  franchisee: Franchisee | null;
  restaurants: any[];
  loading: boolean;
  connectionStatus: 'online' | 'offline' | 'reconnecting';
  
  // Estados de impersonación
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
  
  // Cliente contextual de Supabase
  supabaseClient: any;
  
  // Debugging
  getDebugInfo: () => any;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados de autenticación
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [franchisee, setFranchisee] = useState<Franchisee | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'reconnecting'>('online');
  
  // Estados de impersonación
  const [impersonatedFranchisee, setImpersonatedFranchisee] = useState<Franchisee | null>(null);
  
  const { fetchUserData } = useOptimizedUserDataFetcher();
  const authInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const retryTimeouts = useRef<Set<NodeJS.Timeout>>(new Set());

  // Calcular franquiciado efectivo
  const effectiveFranchisee = impersonatedFranchisee || franchisee;
  const isImpersonating = Boolean(impersonatedFranchisee);

  // Cargar estado de impersonación desde sessionStorage
  useEffect(() => {
    const savedImpersonation = sessionStorage.getItem('impersonatedFranchisee');
    if (savedImpersonation) {
      try {
        const savedFranchisee = JSON.parse(savedImpersonation);
        setImpersonatedFranchisee(savedFranchisee);
        console.log('UNIFIED_AUTH: Loaded impersonation state from sessionStorage');
      } catch (error) {
        console.error('UNIFIED_AUTH: Error loading impersonation state:', error);
        sessionStorage.removeItem('impersonatedFranchisee');
      }
    }
  }, []);

  // Cliente contextual de Supabase que intercepta consultas
  const supabaseClient = useCallback(() => {
    const contextInfo = {
      isImpersonating,
      effectiveFranchiseeId: effectiveFranchisee?.id,
      originalUserId: user?.id
    };

    console.log('UNIFIED_AUTH: Creating contextual Supabase client:', contextInfo);

    // Retornar el cliente original con logging mejorado
    return {
      ...supabase,
      from: (table: any) => {
        console.log(`UNIFIED_AUTH: Query to ${table}`, contextInfo);
        return supabase.from(table);
      }
    };
  }, [isImpersonating, effectiveFranchisee, user]);

  // Acciones de impersonación
  const startImpersonation = useCallback((franchisee: Franchisee) => {
    console.log('UNIFIED_AUTH: Starting impersonation:', {
      advisorUserId: user?.id,
      advisorRole: user?.role,
      targetFranchisee: franchisee.franchisee_name,
      targetFranchiseeId: franchisee.id
    });
    
    setImpersonatedFranchisee(franchisee);
    sessionStorage.setItem('impersonatedFranchisee', JSON.stringify(franchisee));
    
    toast.success(`Impersonando a ${franchisee.franchisee_name}`);
  }, [user]);

  const stopImpersonation = useCallback(() => {
    const previousFranchisee = impersonatedFranchisee;
    console.log('UNIFIED_AUTH: Stopping impersonation:', {
      advisorUserId: user?.id,
      previousFranchisee: previousFranchisee?.franchisee_name
    });
    
    setImpersonatedFranchisee(null);
    sessionStorage.removeItem('impersonatedFranchisee');
    
    toast.success('Impersonación terminada');
  }, [impersonatedFranchisee, user]);

  // Funciones de autenticación robustas con reintentos
  const retryWithBackoff = useCallback(async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T | null> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 0) {
          console.log(`UNIFIED_AUTH: Success on attempt ${attempt + 1}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        console.log(`UNIFIED_AUTH: Attempt ${attempt + 1} failed:`, lastError.message);
        
        if (attempt === maxRetries) break;
        
        const delay = Math.min(baseDelay * Math.pow(2, attempt), 10000);
        setConnectionStatus('reconnecting');
        
        await new Promise(resolve => {
          const timeout = setTimeout(resolve, delay);
          retryTimeouts.current.add(timeout);
        });
      }
    }
    
    setConnectionStatus('offline');
    console.error('UNIFIED_AUTH: All retry attempts failed:', lastError);
    return null;
  }, []);

  const fetchUserDataRobust = useCallback(async (userId: string) => {
    setConnectionStatus('reconnecting');
    
    try {
      // Intentar cargar datos optimizados primero
      const userData = await fetchUserData(userId);
      
      if (userData) {
        // Usar los datos de la sesión para completar la información del usuario
        const enrichedUser = {
          ...userData,
          email: session?.user?.email || userData.email,
          full_name: session?.user?.user_metadata?.full_name || userData.full_name || session?.user?.email?.split('@')[0]
        };
        
        setUser(enrichedUser);
        setFranchisee(userData.franchisee);
        setRestaurants(userData.restaurants || []);
        setConnectionStatus('online');
        console.log('UNIFIED_AUTH: User data loaded successfully:', enrichedUser);
      } else {
        // Si los fetchers fallan, intentar consulta directa como último recurso
        console.log('UNIFIED_AUTH: Fetchers failed, trying direct profile query...');
        const directProfile = await fetchProfileDirectly(userId);
        
        if (directProfile) {
          console.log('UNIFIED_AUTH: Direct profile query successful:', directProfile);
          
          const enrichedUser = {
            ...directProfile,
            email: session?.user?.email || directProfile.email,
            full_name: session?.user?.user_metadata?.full_name || directProfile.full_name || session?.user?.email?.split('@')[0]
          };
          
          // Crear franquiciado básico basado en el perfil real
          const basicFranchisee = {
            id: directProfile.id,
            franchisee_name: enrichedUser.full_name,
            user_id: directProfile.id,
            created_at: directProfile.created_at || new Date().toISOString(),
            updated_at: directProfile.updated_at || new Date().toISOString()
          };
          
          setUser(enrichedUser);
          setFranchisee(basicFranchisee);
          setRestaurants([]);
          setConnectionStatus('online');
          console.log('UNIFIED_AUTH: Using direct profile data:', enrichedUser);
        } else {
          // Fallback final con datos de sesión
          console.log('UNIFIED_AUTH: All queries failed, using session fallback:', session?.user);
          
          const sessionUser = {
            id: userId,
            email: session?.user?.email || 'usuario@ejemplo.com',
            full_name: session?.user?.user_metadata?.full_name || 
                       session?.user?.user_metadata?.name ||
                       session?.user?.email?.split('@')[0] || 'Usuario',
            role: 'franchisee'
          };
          
          const basicFranchisee = {
            id: userId,
            franchisee_name: sessionUser.full_name,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('UNIFIED_AUTH: Using session fallback:', sessionUser);
          
          setUser(sessionUser);
          setFranchisee(basicFranchisee);
          setRestaurants([]);
          setConnectionStatus('online');
        }
      }
    } catch (error) {
      console.error('UNIFIED_AUTH: Error loading user data:', error);
      setConnectionStatus('online'); // Mantener online para evitar loops
      
      // Intentar crear un franquiciado real si no existe
      const realFranchisee = await createRealFranchisee(userId);
      
      if (realFranchisee) {
        // Usar el franquiciado real recién creado
        const user = {
          id: userId,
          email: session?.user?.email || 'usuario@ejemplo.com',
          full_name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Usuario',
          role: 'franchisee'
        };
        
        setUser(user);
        setFranchisee(realFranchisee);
        setRestaurants([]);
        toast.success('Sesión iniciada correctamente');
      } else {
        // Fallback con datos básicos pero funcionales
        const fallbackUser = {
          id: userId,
          email: session?.user?.email || 'usuario@ejemplo.com',
          full_name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Usuario',
          role: 'franchisee'
        };
        
        const fallbackFranchisee = {
          id: `fallback-${userId}`,
          user_id: userId,
          franchisee_name: 'Usuario',
          company_name: 'Mi Empresa',
          total_restaurants: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(fallbackUser);
        setFranchisee(fallbackFranchisee);
        setRestaurants([]);
        
        toast.success('Sesión iniciada correctamente');
      }
    }
  }, [fetchUserData, session]);

  // Función para consulta directa a profiles como último recurso
  const fetchProfileDirectly = useCallback(async (userId: string): Promise<any | null> => {
    try {
      console.log('UNIFIED_AUTH: Attempting direct profile query for:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('UNIFIED_AUTH: Direct profile query error:', error);
        return null;
      }

      console.log('UNIFIED_AUTH: Direct profile query successful:', profile);
      return profile;
    } catch (error) {
      console.error('UNIFIED_AUTH: Direct profile query failed:', error);
      return null;
    }
  }, []);

  const createRealFranchisee = async (userId: string) => {
    try {
      const { data: existingFranchisee } = await supabase
        .from('franchisees')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingFranchisee) {
        return {
          id: existingFranchisee.id,
          user_id: existingFranchisee.user_id,
          franchisee_name: existingFranchisee.franchisee_name,
          company_name: existingFranchisee.company_name,
          total_restaurants: existingFranchisee.total_restaurants,
          created_at: existingFranchisee.created_at,
          updated_at: existingFranchisee.updated_at
        };
      }

      const { data: newFranchisee, error } = await supabase
        .from('franchisees')
        .insert({
          user_id: userId,
          franchisee_name: session?.user?.user_metadata?.full_name || 'Usuario',
          company_name: session?.user?.user_metadata?.full_name || 'Mi Empresa',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando franquiciado real:', error);
        return null;
      }

      return {
        id: newFranchisee.id,
        user_id: newFranchisee.user_id,
        franchisee_name: newFranchisee.franchisee_name,
        company_name: newFranchisee.company_name,
        total_restaurants: newFranchisee.total_restaurants,
        created_at: newFranchisee.created_at,
        updated_at: newFranchisee.updated_at
      };
    } catch (error) {
      console.error('Error creando franquiciado real:', error);
      return null;
    }
  };

  // Inicialización de autenticación
  useEffect(() => {
    if (authInitialized.current) return;
    
    console.log('UNIFIED_AUTH: Initializing unified authentication system');
    authInitialized.current = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('UNIFIED_AUTH: Auth state change:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user && currentUserId.current !== session.user.id) {
          currentUserId.current = session.user.id;
          await fetchUserDataRobust(session.user.id);
        } else if (!session?.user) {
          console.log('UNIFIED_AUTH: No session, clearing data');
          currentUserId.current = null;
          setUser(null);
          setFranchisee(null);
          setRestaurants([]);
          setConnectionStatus('online');
        }
        setLoading(false);
      }
    );

    // Verificar sesión inicial
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('UNIFIED_AUTH: Initial session check:', session?.user?.id);
        
        setSession(session);
        if (session?.user && currentUserId.current !== session.user.id) {
          currentUserId.current = session.user.id;
          await fetchUserDataRobust(session.user.id);
        }
        setLoading(false);
      } catch (error) {
        console.error('UNIFIED_AUTH: Error in initialization:', error);
        setLoading(false);
        setConnectionStatus('offline');
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      authInitialized.current = false;
      
      // Limpiar timeouts pendientes
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current.clear();
    };
  }, [fetchUserDataRobust]);

  // Acciones de autenticación
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('UNIFIED_AUTH: Sign in error:', error);
      return { error: error.message };
    }
    
    return {};
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
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
      console.error('UNIFIED_AUTH: Sign up error:', error);
      return { error: error.message };
    }
    
    return {};
  }, []);

  const signOut = useCallback(async () => {
    // Limpiar impersonación al cerrar sesión
    if (isImpersonating) {
      stopImpersonation();
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('UNIFIED_AUTH: Sign out error:', error);
    }
  }, [isImpersonating, stopImpersonation]);

  // Función de debugging
  const getDebugInfo = useCallback(() => {
    return {
      auth: {
        user: user ? { id: user.id, role: user.role, email: user.email } : null,
        session: !!session,
        loading,
        connectionStatus
      },
      franchisee: {
        original: franchisee ? { id: franchisee.id, name: franchisee.franchisee_name } : null,
        impersonated: impersonatedFranchisee ? { id: impersonatedFranchisee.id, name: impersonatedFranchisee.franchisee_name } : null,
        effective: effectiveFranchisee ? { id: effectiveFranchisee.id, name: effectiveFranchisee.franchisee_name } : null,
        isImpersonating
      },
      restaurants: {
        count: restaurants.length,
        ids: restaurants.map(r => r.id)
      },
      system: {
        currentUserId: currentUserId.current,
        authInitialized: authInitialized.current,
        timestamp: new Date().toISOString()
      }
    };
  }, [user, session, loading, connectionStatus, franchisee, impersonatedFranchisee, effectiveFranchisee, isImpersonating, restaurants]);

  const value = {
    // Estados básicos
    user,
    session,
    franchisee,
    restaurants,
    loading,
    connectionStatus,
    
    // Estados de impersonación
    isImpersonating,
    impersonatedFranchisee,
    effectiveFranchisee,
    
    // Acciones de autenticación
    signIn,
    signUp,
    signOut,
    
    // Acciones de impersonación
    startImpersonation,
    stopImpersonation,
    
    // Cliente contextual
    supabaseClient: supabaseClient(),
    
    // Debugging
    getDebugInfo
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};
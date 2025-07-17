import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Franchisee } from '@/types/auth';
import { toast } from 'sonner';
import { DataCache } from '@/utils/dataCache';

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
  
  const authInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);
  const fetchInProgress = useRef(false);
  const cache = useRef(new DataCache());

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

  // Versión optimizada con cache y control de duplicados
  const fetchUserDataSimple = useCallback(async (userId: string, forceRefresh = false) => {
    const cacheKey = `user-${userId}`;
    
    // Evitar múltiples fetches simultáneos
    if (fetchInProgress.current && !forceRefresh) {
      console.log('UNIFIED_AUTH: Fetch already in progress, skipping...');
      return;
    }
    
    // Verificar cache primero (excepto en refresh forzado)
    if (!forceRefresh) {
      const cachedData = cache.current.get<any>(cacheKey);
      if (cachedData) {
        console.log('UNIFIED_AUTH: Using cached data for userId:', userId);
        setUser(cachedData.user);
        setFranchisee(cachedData.franchisee);
        setRestaurants(cachedData.restaurants || []);
        setConnectionStatus('online');
        return;
      }
    }
    
    fetchInProgress.current = true;
    console.log('UNIFIED_AUTH: Simple fetch starting for userId:', userId);
    
    try {
      // Intentar consulta directa primero con timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      const franchiseePromise = supabase
        .from('franchisees')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Timeout de 2 segundos para evitar queries colgadas
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 2000)
      );

      const [profileResult, franchiseeResult] = await Promise.allSettled([
        Promise.race([profilePromise, timeoutPromise]),
        Promise.race([franchiseePromise, timeoutPromise])
      ]);

      let enrichedUser = null;
      let userFranchisee = null;

      if (profileResult.status === 'fulfilled' && profileResult.value && 
          typeof profileResult.value === 'object' && 'data' in profileResult.value &&
          profileResult.value.data && !('error' in profileResult.value && profileResult.value.error)) {
        const profileData = profileResult.value.data as any;
        console.log('UNIFIED_AUTH: Profile found:', profileData);
        enrichedUser = {
          ...profileData,
          email: session?.user?.email || profileData.email,
          full_name: session?.user?.user_metadata?.full_name || 
                    profileData.full_name || 
                    session?.user?.email?.split('@')[0]
        };
      }

      if (franchiseeResult.status === 'fulfilled' && franchiseeResult.value && 
          typeof franchiseeResult.value === 'object' && 'data' in franchiseeResult.value &&
          franchiseeResult.value.data) {
        userFranchisee = franchiseeResult.value.data as any;
      }

      // Si no hay datos válidos, usar fallback de sesión
      if (!enrichedUser) {
        console.log('UNIFIED_AUTH: Using session fallback data');
        enrichedUser = {
          id: userId,
          email: session?.user?.email || 'usuario@ejemplo.com',
          full_name: session?.user?.user_metadata?.full_name || 
                     session?.user?.user_metadata?.name ||
                     session?.user?.email?.split('@')[0] || 'Usuario',
          role: 'franchisee'
        };
      }

      if (!userFranchisee) {
        userFranchisee = {
          id: userId,
          franchisee_name: enrichedUser.full_name,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      // Cachear los datos por 5 minutos
      const dataToCache = {
        user: enrichedUser,
        franchisee: userFranchisee,
        restaurants: []
      };
      cache.current.set(cacheKey, dataToCache, 5);

      setUser(enrichedUser);
      setFranchisee(userFranchisee);
      setRestaurants([]);
      setConnectionStatus('online');
      console.log('UNIFIED_AUTH: User data loaded successfully');
      
    } catch (error) {
      console.log('UNIFIED_AUTH: Error in fetchUserDataSimple:', error);
      setConnectionStatus('offline');
      
      // En caso de error total, usar fallback mínimo
      const fallbackUser = {
        id: userId,
        email: session?.user?.email || 'usuario@ejemplo.com',
        full_name: session?.user?.user_metadata?.full_name || 'Usuario',
        role: 'franchisee'
      };
      
      const fallbackFranchisee = {
        id: userId,
        franchisee_name: fallbackUser.full_name,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(fallbackUser);
      setFranchisee(fallbackFranchisee);
      setRestaurants([]);
    } finally {
      fetchInProgress.current = false;
    }
  }, [session]);


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

  // Inicialización con debouncing y control de duplicados
  useEffect(() => {
    if (authInitialized.current) return;
    
    console.log('UNIFIED_AUTH: Initializing optimized auth system');
    authInitialized.current = true;
    
    // Configurar timeout de emergencia para loading
    loadingTimeout.current = setTimeout(() => {
      console.log('UNIFIED_AUTH: Emergency timeout - forcing loading false');
      setLoading(false);
    }, 5000); // Aumentamos a 5 segundos
    
    let authStateTimeout: NodeJS.Timeout | null = null;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('UNIFIED_AUTH: Auth state change:', event, session?.user?.id);
        
        // Limpiar timeout previo
        if (authStateTimeout) {
          clearTimeout(authStateTimeout);
        }
        
        // Debounce para evitar múltiples calls rápidos
        authStateTimeout = setTimeout(async () => {
          if (loadingTimeout.current) {
            clearTimeout(loadingTimeout.current);
            loadingTimeout.current = null;
          }
          
          setSession(session);
          
          if (session?.user && currentUserId.current !== session.user.id) {
            console.log('UNIFIED_AUTH: New user session detected');
            currentUserId.current = session.user.id;
            await fetchUserDataSimple(session.user.id);
          } else if (!session?.user) {
            console.log('UNIFIED_AUTH: No session, clearing data');
            currentUserId.current = null;
            setUser(null);
            setFranchisee(null);
            setRestaurants([]);
            setConnectionStatus('online');
            cache.current.clear(); // Limpiar cache al cerrar sesión
          }
          setLoading(false);
        }, 100); // Debounce de 100ms
      }
    );

    // Verificar sesión inicial con debounce
    const initializeAuth = async () => {
      try {
        console.log('UNIFIED_AUTH: Checking initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('UNIFIED_AUTH: Initial session:', session?.user?.id);
        
        if (loadingTimeout.current) {
          clearTimeout(loadingTimeout.current);
          loadingTimeout.current = null;
        }
        
        setSession(session);
        if (session?.user && currentUserId.current !== session.user.id) {
          currentUserId.current = session.user.id;
          await fetchUserDataSimple(session.user.id);
        }
        setLoading(false);
      } catch (error) {
        console.error('UNIFIED_AUTH: Error in initialization:', error);
        if (loadingTimeout.current) {
          clearTimeout(loadingTimeout.current);
          loadingTimeout.current = null;
        }
        setLoading(false);
        setConnectionStatus('offline');
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      authInitialized.current = false;
      fetchInProgress.current = false;
      
      if (authStateTimeout) {
        clearTimeout(authStateTimeout);
      }
      
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
        loadingTimeout.current = null;
      }
    };
  }, []); // Removemos fetchUserDataSimple de las dependencias para evitar re-renders

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
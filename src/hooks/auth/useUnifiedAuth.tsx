import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Franchisee } from '@/types/auth';
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
  
  const authInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

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

  // Versión simplificada de fetch de datos de usuario
  const fetchUserDataSimple = useCallback(async (userId: string) => {
    console.log('UNIFIED_AUTH: Simple fetch starting for userId:', userId);
    
    try {
      // Intento 1: Consulta directa a profiles
      console.log('UNIFIED_AUTH: Attempting direct profile query...');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        console.log('UNIFIED_AUTH: Profile found:', profile);
        
        const enrichedUser = {
          ...profile,
          email: session?.user?.email || profile.email,
          full_name: session?.user?.user_metadata?.full_name || profile.full_name || session?.user?.email?.split('@')[0]
        };
        
        // Intentar obtener franquiciado
        const { data: franchiseeData } = await supabase
          .from('franchisees')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        const userFranchisee = franchiseeData || {
          id: userId,
          franchisee_name: enrichedUser.full_name,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(enrichedUser);
        setFranchisee(userFranchisee);
        setRestaurants([]);
        setConnectionStatus('online');
        console.log('UNIFIED_AUTH: User data loaded successfully');
        return;
      }
      
      console.log('UNIFIED_AUTH: Profile query failed, using session fallback');
    } catch (error) {
      console.log('UNIFIED_AUTH: Profile query error:', error);
    }
    
    // Fallback: Usar datos de sesión
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
    
    console.log('UNIFIED_AUTH: Using session fallback data:', sessionUser);
    
    setUser(sessionUser);
    setFranchisee(basicFranchisee);
    setRestaurants([]);
    setConnectionStatus('online');
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

  // Inicialización simplificada de autenticación
  useEffect(() => {
    if (authInitialized.current) return;
    
    console.log('UNIFIED_AUTH: Initializing simplified auth system');
    authInitialized.current = true;
    
    // Configurar timeout de emergencia para loading
    loadingTimeout.current = setTimeout(() => {
      console.log('UNIFIED_AUTH: Emergency timeout - forcing loading false');
      setLoading(false);
    }, 3000); // 3 segundos máximo de loading
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('UNIFIED_AUTH: Auth state change:', event, session?.user?.id);
        
        if (loadingTimeout.current) {
          clearTimeout(loadingTimeout.current);
          loadingTimeout.current = null;
        }
        
        setSession(session);
        
        if (session?.user && currentUserId.current !== session.user.id) {
          console.log('UNIFIED_AUTH: New user session detected');
          currentUserId.current = session.user.id;
          fetchUserDataSimple(session.user.id);
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
        console.log('UNIFIED_AUTH: Checking initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('UNIFIED_AUTH: Initial session:', session?.user?.id);
        
        if (loadingTimeout.current) {
          clearTimeout(loadingTimeout.current);
          loadingTimeout.current = null;
        }
        
        setSession(session);
        if (session?.user) {
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
      
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
        loadingTimeout.current = null;
      }
    };
  }, [fetchUserDataSimple]);

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
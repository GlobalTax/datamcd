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
    
    const userData = await retryWithBackoff(() => fetchUserData(userId));

    if (userData) {
      setUser(userData);
      setFranchisee(userData.franchisee);
      setRestaurants(userData.restaurants || []);
      setConnectionStatus('online');
      console.log('UNIFIED_AUTH: User data loaded successfully');
    } else {
      setConnectionStatus('offline');
      toast.error('Error al cargar datos del usuario. Trabajando en modo offline.');
      
      // Fallback con datos básicos
      setUser({
        id: userId,
        email: 'usuario@ejemplo.com',
        full_name: 'Usuario',
        role: 'franchisee'
      });
    }
  }, [fetchUserData, retryWithBackoff]);

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
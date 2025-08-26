import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { useRateLimiting } from '@/hooks/useRateLimiting';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  connectionStatus: 'online' | 'offline' | 'reconnecting';
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  getDebugInfo?: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    logger.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'reconnecting'>('online');
  
  const { checkRateLimit } = useRateLimiting();

  // Initialize auth state
  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed', { event, userId: session?.user?.id });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast.success('Sesión iniciada correctamente');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    if (!checkRateLimit('auth_attempt', 5, 300)) {
      return { error: 'Demasiados intentos. Espera 5 minutos.' };
    }

    try {
      logger.info('Attempting sign in', { email });
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Sign in failed', { error: error.message });
        return { error: error.message };
      }

      logger.info('Sign in successful', { email });
      return {};
    } catch (error) {
      logger.error('Unexpected sign in error', { error });
      return { error: 'Error inesperado durante el inicio de sesión' };
    }
  }, [checkRateLimit]);

  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<{ error?: string }> => {
    if (!checkRateLimit('signup_attempt', 3, 600)) {
      return { error: 'Demasiados intentos. Espera 10 minutos.' };
    }

    try {
      logger.info('Attempting sign up', { email, fullName });
      
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
        logger.error('Sign up failed', { error: error.message });
        return { error: error.message };
      }

      logger.info('Sign up successful', { email });
      toast.success('Registro exitoso. Revisa tu email para confirmar la cuenta.');
      return {};
    } catch (error) {
      logger.error('Unexpected sign up error', { error });
      return { error: 'Error inesperado durante el registro' };
    }
  }, [checkRateLimit]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      logger.info('Attempting sign out', { userId: user?.id });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Sign out failed', { error: error.message });
        toast.error('Error al cerrar sesión');
        return;
      }

      logger.info('Sign out successful');
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      logger.error('Unexpected sign out error', { error });
      toast.error('Error inesperado al cerrar sesión');
    }
  }, [user]);

  const getDebugInfo = useCallback(() => {
    return {
      user: user ? { id: user.id, email: user.email } : null,
      session: session ? { expires_at: session.expires_at } : null,
      connectionStatus,
      loading
    };
  }, [user, session, connectionStatus, loading]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    connectionStatus,
    signIn,
    signUp,
    signOut,
    getDebugInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
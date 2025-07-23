
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from '@/types/auth';
import { adaptSupabaseUser, isValidSupabaseUser } from '@/types/supabase-adapters';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
}

export type AuthHook = AuthState & AuthActions;

export const useAuthState = (): AuthHook => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateAuthState = useCallback((session: Session | null) => {
    setSession(session);
    
    if (session?.user && isValidSupabaseUser(session.user)) {
      const adaptedUser = adaptSupabaseUser(session.user);
      setUser(adaptedUser);
    } else {
      setUser(null);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    // Configurar listener de cambios de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        updateAuthState(session);
      }
    );

    // Verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, [updateAuthState]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Error de inicio de sesión: ' + error.message);
        return { error: error.message };
      }

      toast.success('Sesión iniciada correctamente');
      return {};
    } catch (error: any) {
      toast.error('Error inesperado al iniciar sesión');
      return { error: error.message };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast.error('Error de registro: ' + error.message);
        return { error: error.message };
      }

      toast.success('Cuenta creada correctamente');
      return {};
    } catch (error: any) {
      toast.error('Error inesperado al crear cuenta');
      return { error: error.message };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('Sign out exception:', error);
    }
  }, []);

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
  };
};

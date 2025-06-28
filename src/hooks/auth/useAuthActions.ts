
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = () => {
  // Acciones de autenticación simplificadas
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Sign in error:', error);
        return { error: error.message };
      }
      return {};
    } catch (error) {
      console.error('Sign in network error:', error);
      return { error: 'Error de conexión' };
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
          data: { full_name: fullName }
        }
      });
      if (error) {
        console.error('Sign up error:', error);
        return { error: error.message };
      }
      return {};
    } catch (error) {
      console.error('Sign up network error:', error);
      return { error: 'Error de conexión' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  return { signIn, signUp, signOut };
};

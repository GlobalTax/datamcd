
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthActionsProps {
  clearUserData: () => void;
  setSession: (session: any) => void;
}

export const useAuthActions = ({ clearUserData, setSession }: AuthActionsProps) => {
  
  const signIn = async (email: string, password: string) => {
    console.log('signIn - Attempting login for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('signIn - Error:', error);
        toast.error(error.message);
        return { error: error.message };
      } else {
        console.log('signIn - Success, user data:', data.user);
        toast.success('Sesión iniciada correctamente');
        return {};
      }
    } catch (error) {
      console.error('signIn - Unexpected error:', error);
      toast.error('Error inesperado al iniciar sesión');
      return { error: 'Error inesperado al iniciar sesión' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    try {
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
        toast.error(error.message);
        return { error: error.message };
      } else {
        toast.success('Cuenta creada correctamente. Revisa tu email para confirmar tu cuenta.');
        return {};
      }
    } catch (error) {
      console.error('signUp - Unexpected error:', error);
      toast.error('Error inesperado al crear cuenta');
      return { error: 'Error inesperado al crear cuenta' };
    }
  };

  const signOut = async () => {
    try {
      console.log('signOut - Starting logout process');
      
      // Clear user data immediately to prevent UI delays
      clearUserData();
      setSession(null);
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('signOut - Error:', error);
        // Don't show error toast for session_not_found errors as they're harmless
        if (!error.message.includes('Session not found')) {
          toast.error(error.message);
        }
      } else {
        console.log('signOut - Success');
        toast.success('Sesión cerrada correctamente');
      }
    } catch (error) {
      console.error('signOut - Unexpected error:', error);
      // Still clear the local state even if there's an error
      clearUserData();
      setSession(null);
    }
  };

  return { signIn, signUp, signOut };
};

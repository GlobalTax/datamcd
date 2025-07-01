
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthActionsProps {
  clearUserData: () => void;
  setSession: (session: any) => void;
}

export const useAuthActions = ({ clearUserData, setSession }: AuthActionsProps) => {
  
  const signIn = async (email: string, password: string) => {
    console.log('useAuthActions - Attempting login for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('useAuthActions - Sign in error:', error);
        
        // Manejar errores específicos
        let errorMessage = 'Error al iniciar sesión';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor confirma tu email antes de iniciar sesión';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos. Intenta de nuevo en unos minutos';
        } else {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        return { error: errorMessage };
      } else {
        console.log('useAuthActions - Sign in successful for:', data.user?.email);
        toast.success('Sesión iniciada correctamente');
        return {};
      }
    } catch (error) {
      console.error('useAuthActions - Unexpected sign in error:', error);
      toast.error('Error inesperado al iniciar sesión');
      return { error: 'Error inesperado al iniciar sesión' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('useAuthActions - Attempting sign up for:', email);
    
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
        console.error('useAuthActions - Sign up error:', error);
        
        // Manejar errores específicos
        let errorMessage = 'Error al crear cuenta';
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email ya está registrado';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email inválido';
        } else {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        return { error: errorMessage };
      } else {
        console.log('useAuthActions - Sign up successful for:', email);
        toast.success('Cuenta creada correctamente. Revisa tu email para confirmar tu cuenta.');
        return {};
      }
    } catch (error) {
      console.error('useAuthActions - Unexpected sign up error:', error);
      toast.error('Error inesperado al crear cuenta');
      return { error: 'Error inesperado al crear cuenta' };
    }
  };

  const signOut = async () => {
    try {
      console.log('useAuthActions - Starting logout process');
      
      // Clear user data immediately to prevent UI delays
      clearUserData();
      setSession(null);
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('useAuthActions - Sign out error:', error);
        // Don't show error toast for session_not_found errors as they're harmless
        if (!error.message.includes('Session not found')) {
          toast.error(error.message);
        }
      } else {
        console.log('useAuthActions - Sign out successful');
        toast.success('Sesión cerrada correctamente');
      }
    } catch (error) {
      console.error('useAuthActions - Unexpected sign out error:', error);
      // Still clear the local state even if there's an error
      clearUserData();
      setSession(null);
      toast.success('Sesión cerrada correctamente');
    }
  };

  return { signIn, signUp, signOut };
};

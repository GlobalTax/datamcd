
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';
import { useAuthRecovery } from './useAuthRecovery';

interface FastAuthActionsProps {
  clearUserData: () => void;
  setSession: (session: any) => void;
  onAuthSuccess?: (userData: any) => void;
}

export const useFastAuthActions = ({ clearUserData, setSession, onAuthSuccess }: FastAuthActionsProps) => {
  const { createEmergencyProfile } = useAuthRecovery();

  const fastSignIn = async (email: string, password: string) => {
    console.log('useFastAuthActions - Fast sign in attempt for:', email);
    
    try {
      // Timeout más corto para signIn
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout')), 10000)
      );

      const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any;

      if (error) {
        console.error('useFastAuthActions - Sign in error:', error);
        
        let errorMessage = 'Error al iniciar sesión';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor confirma tu email antes de iniciar sesión';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Conexión lenta. Intenta de nuevo o usa el modo de recuperación.';
        }
        
        showError(errorMessage);
        return { error: errorMessage };
      }

      if (data.user) {
        console.log('useFastAuthActions - Sign in successful');
        showSuccess('Sesión iniciada correctamente');
        return { success: true };
      }

      return { error: 'Error inesperado' };
    } catch (error: any) {
      console.error('useFastAuthActions - Sign in timeout or error:', error);
      
      if (error.message.includes('timeout')) {
        showError('Conexión lenta. El sistema intentará conectar en segundo plano.');
        return { error: 'timeout', canRetry: true };
      }
      
      showError('Error de conexión al iniciar sesión');
      return { error: 'Error de conexión' };
    }
  };

  const fastSignUp = async (email: string, password: string, fullName: string) => {
    console.log('useFastAuthActions - Fast sign up attempt for:', email);
    
    try {
      // Intentar signUp normal primero con timeout
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signup timeout')), 8000)
      );

      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]) as any;

      if (error) {
        console.log('useFastAuthActions - Normal signup failed, trying emergency mode');
        
        if (error.message.includes('User already registered')) {
          showError('Este email ya está registrado. Intenta iniciar sesión.');
          return { error: 'Este email ya está registrado' };
        }
        
        // Si falla, intentar modo de emergencia
        const emergencyResult = await createEmergencyProfile(email, password, fullName);
        if (emergencyResult.error) {
          showError(emergencyResult.error);
          return { error: emergencyResult.error };
        }
        
        if (emergencyResult.user) {
          showSuccess('Cuenta creada en modo de recuperación');
          onAuthSuccess?.(emergencyResult);
          return { success: true, recoveryMode: true };
        }
      }

      if (data.user) {
        console.log('useFastAuthActions - Normal signup successful');
        showSuccess('Cuenta creada correctamente. Revisa tu email para confirmar.');
        return { success: true };
      }

      return { error: 'Error inesperado al crear cuenta' };
    } catch (error: any) {
      console.log('useFastAuthActions - Signup timeout, trying emergency creation');
      
      // En caso de timeout, intentar modo de emergencia
      const emergencyResult = await createEmergencyProfile(email, password, fullName);
      if (emergencyResult.error) {
        showError('Error de conexión. Intenta de nuevo más tarde.');
        return { error: emergencyResult.error };
      }
      
      if (emergencyResult.user) {
        showSuccess('Cuenta creada en modo de recuperación');
        onAuthSuccess?.(emergencyResult);
        return { success: true, recoveryMode: true };
      }
      
      return { error: 'Error de conexión' };
    }
  };

  const signOut = async () => {
    try {
      console.log('useFastAuthActions - Fast sign out');
      clearUserData();
      setSession(null);
      
      // Intentar signOut en segundo plano
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.log('Background signout failed, but local state cleared');
        }
      }, 0);
      
      showSuccess('Sesión cerrada correctamente');
    } catch (error) {
      console.error('useFastAuthActions - Sign out error:', error);
      clearUserData();
      setSession(null);
      showSuccess('Sesión cerrada correctamente');
    }
  };

  return { fastSignIn, fastSignUp, signOut };
};

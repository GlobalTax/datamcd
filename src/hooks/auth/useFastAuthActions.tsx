
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

  const fastSignIn = async (email: string, password: string, isRetry = false) => {
    console.log('useFastAuthActions - Fast sign in attempt for:', email, isRetry ? '(retry)' : '');
    
    try {
      // Timeout progresivo: 12s para primer intento, 20s para retry
      const timeoutMs = isRetry ? 20000 : 12000;
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout')), timeoutMs)
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
          errorMessage = 'Conexión lenta detectada. ¿Intentar con más tiempo?';
        }
        
        showError(errorMessage);
        return { error: errorMessage, canRetry: !isRetry && error.message.includes('timeout') };
      }

      if (data.user) {
        console.log('useFastAuthActions - Sign in successful');
        showSuccess('Sesión iniciada correctamente');
        return { success: true };
      }

      return { error: 'Error inesperado' };
    } catch (error: any) {
      console.error('useFastAuthActions - Sign in timeout or error:', error);
      
      if (error.message.includes('timeout') && !isRetry) {
        showError('Conexión lenta. ¿Quieres intentar con más tiempo o crear cuenta de emergencia?');
        return { error: 'timeout', canRetry: true };
      }
      
      showError('Error de conexión al iniciar sesión');
      return { error: 'Error de conexión' };
    }
  };

  const fastSignUp = async (email: string, password: string, fullName: string, isRetry = false) => {
    console.log('useFastAuthActions - Fast sign up attempt for:', email, isRetry ? '(retry)' : '');
    
    try {
      // Timeout progresivo: 15s para primer intento, 25s para retry
      const timeoutMs = isRetry ? 25000 : 15000;
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signup timeout')), timeoutMs)
      );

      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]) as any;

      if (error) {
        console.log('useFastAuthActions - Normal signup failed:', error.message);
        
        if (error.message.includes('User already registered')) {
          showError('Este email ya está registrado. Intenta iniciar sesión.');
          return { error: 'Este email ya está registrado' };
        }
        
        // Si falla, ofrecer modo de emergencia
        if (!isRetry) {
          showError('Signup falló. ¿Crear cuenta de emergencia?');
          return { error: error.message, canCreateEmergency: true };
        }
        
        // En retry, crear directamente cuenta de emergencia
        const emergencyResult = await createEmergencyProfile(email, password, fullName);
        if (emergencyResult.error) {
          showError(emergencyResult.error);
          return { error: emergencyResult.error };
        }
        
        if (emergencyResult.user) {
          showSuccess('Cuenta creada en modo de emergencia');
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
      console.log('useFastAuthActions - Signup timeout, evaluating emergency creation');
      
      // En caso de timeout, crear cuenta de emergencia si es retry o si el usuario lo pidió
      if (isRetry || error.message.includes('timeout')) {
        const emergencyResult = await createEmergencyProfile(email, password, fullName);
        if (emergencyResult.error) {
          showError('Error de conexión. Intenta de nuevo más tarde.');
          return { error: emergencyResult.error };
        }
        
        if (emergencyResult.user) {
          showSuccess('Cuenta creada en modo de emergencia debido a problemas de conexión');
          onAuthSuccess?.(emergencyResult);
          return { success: true, recoveryMode: true };
        }
      }
      
      return { error: 'Error de conexión', canCreateEmergency: true };
    }
  };

  const createEmergencyAccount = async (email: string, password: string, fullName: string) => {
    console.log('useFastAuthActions - Creating emergency account for:', email);
    showSuccess('Creando cuenta de emergencia...');
    
    const emergencyResult = await createEmergencyProfile(email, password, fullName);
    if (emergencyResult.error) {
      showError('Error al crear cuenta de emergencia: ' + emergencyResult.error);
      return { error: emergencyResult.error };
    }
    
    if (emergencyResult.user) {
      showSuccess('¡Cuenta de emergencia creada! Puedes acceder inmediatamente.');
      onAuthSuccess?.(emergencyResult);
      return { success: true, recoveryMode: true };
    }
    
    return { error: 'Error inesperado' };
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

  return { fastSignIn, fastSignUp, createEmergencyAccount, signOut };
};

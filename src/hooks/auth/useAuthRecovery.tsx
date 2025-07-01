
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee } from '@/types/auth';

export const useAuthRecovery = () => {
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const createEmergencyProfile = useCallback(async (email: string, password: string, fullName: string) => {
    console.log('useAuthRecovery - Creating emergency profile for:', email);
    
    try {
      // Intentar crear usuario con configuración simplificada
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('useAuthRecovery - Error creating user:', error);
        return { error: error.message };
      }

      if (data.user) {
        console.log('useAuthRecovery - User created successfully, preparing recovery data');
        
        // Crear datos básicos de recuperación
        const recoveryUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          role: 'franchisee',
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setIsRecoveryMode(true);
        
        return { 
          user: recoveryUser,
          message: 'Cuenta creada en modo de recuperación. Los datos adicionales se cargarán cuando el sistema esté disponible.'
        };
      }

      return { error: 'No se pudo crear el usuario' };
    } catch (error) {
      console.error('useAuthRecovery - Unexpected error:', error);
      return { error: 'Error inesperado al crear la cuenta' };
    }
  }, []);

  const attemptDataRecovery = useCallback(async (userId: string) => {
    console.log('useAuthRecovery - Attempting data recovery for:', userId);
    
    try {
      // Intentar crear perfil básico en la base de datos
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: 'usuario@ejemplo.com',
          role: 'franchisee',
          full_name: 'Usuario Recuperado',
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.log('useAuthRecovery - Profile creation failed, but continuing');
      } else {
        console.log('useAuthRecovery - Profile created successfully');
      }

      return true;
    } catch (error) {
      console.log('useAuthRecovery - Data recovery failed, but user can still access');
      return false;
    }
  }, []);

  const exitRecoveryMode = useCallback(() => {
    setIsRecoveryMode(false);
  }, []);

  return {
    isRecoveryMode,
    createEmergencyProfile,
    attemptDataRecovery,
    exitRecoveryMode
  };
};

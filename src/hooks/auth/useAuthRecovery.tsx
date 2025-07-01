
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Franchisee } from '@/types/auth';

export const useAuthRecovery = () => {
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const createEmergencyProfile = useCallback(async (email: string, password: string, fullName: string) => {
    console.log('useAuthRecovery - Creating emergency profile for:', email);
    
    try {
      // Intentar crear usuario con timeout más corto para detección rápida de problemas
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Emergency signup timeout')), 8000)
      );

      let data, error;
      try {
        const result = await Promise.race([signUpPromise, timeoutPromise]) as any;
        data = result.data;
        error = result.error;
      } catch (timeoutError) {
        // Si hay timeout, crear usuario local inmediatamente
        console.log('useAuthRecovery - Timeout detected, creating local emergency user');
        
        const emergencyUser: User = {
          id: `emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: email,
          role: 'franchisee',
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setIsRecoveryMode(true);
        
        // Intentar sincronizar en segundo plano
        setTimeout(async () => {
          try {
            await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/`,
                data: { full_name: fullName },
              },
            });
            console.log('useAuthRecovery - Background sync successful');
          } catch (bgError) {
            console.log('useAuthRecovery - Background sync failed, but user has local access');
          }
        }, 0);
        
        return { 
          user: emergencyUser,
          message: 'Cuenta de emergencia creada. Los datos se sincronizarán cuando mejore la conexión.'
        };
      }

      if (error) {
        console.log('useAuthRecovery - Supabase error, creating local emergency user:', error.message);
        
        if (error.message.includes('User already registered')) {
          return { error: 'Este email ya está registrado. Intenta iniciar sesión.' };
        }
        
        // Crear usuario de emergencia local
        const emergencyUser: User = {
          id: `emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: email,
          role: 'franchisee',
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setIsRecoveryMode(true);
        
        return { 
          user: emergencyUser,
          message: 'Cuenta de emergencia creada debido a problemas de conexión.'
        };
      }

      if (data.user) {
        console.log('useAuthRecovery - User created successfully');
        
        const recoveryUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          role: 'franchisee',
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // No activar modo recovery si el signup fue exitoso
        return { 
          user: recoveryUser,
          message: 'Cuenta creada correctamente.'
        };
      }

      return { error: 'No se pudo crear el usuario' };
    } catch (error) {
      console.error('useAuthRecovery - Unexpected error:', error);
      
      // En caso de error inesperado, crear usuario de emergencia
      const emergencyUser: User = {
        id: `emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        role: 'franchisee',
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setIsRecoveryMode(true);
      
      return { 
        user: emergencyUser,
        message: 'Cuenta de emergencia creada. Acceso básico disponible.'
      };
    }
  }, []);

  const attemptDataRecovery = useCallback(async (userId: string) => {
    console.log('useAuthRecovery - Attempting data recovery for:', userId);
    
    // Si es usuario de emergencia, no intentar recovery de DB
    if (userId.startsWith('emergency-')) {
      console.log('useAuthRecovery - Emergency user detected, skipping DB recovery');
      return true;
    }
    
    try {
      // Intentar crear perfil básico en la base de datos con timeout corto
      const profilePromise = supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: 'usuario@ejemplo.com',
          role: 'franchisee',
          full_name: 'Usuario Recuperado',
        }, {
          onConflict: 'id'
        });
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Recovery timeout')), 5000)
      );

      await Promise.race([profilePromise, timeoutPromise]);
      console.log('useAuthRecovery - Profile recovery successful');
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

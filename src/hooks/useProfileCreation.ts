import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateProfileData {
  email: string;
  full_name: string;
  role?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: string;
}

/**
 * Hook para crear nuevos perfiles de usuario
 */
export const useProfileCreation = () => {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);

  /**
   * Crear nuevo perfil de usuario
   */
  const createProfile = useCallback(async (profileData: CreateProfileData): Promise<UserProfile | null> => {
    try {
      setCreating(true);

      // Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profileData.email.trim())
        .single();

      if (existingUser) {
        toast({
          title: "Usuario ya existe",
          description: "Ya existe un usuario con ese email",
          variant: "destructive"
        });
        return null;
      }

      // Generar un UUID para el nuevo usuario
      const userId = crypto.randomUUID();

      // Crear el perfil
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: profileData.email.trim(),
          full_name: profileData.full_name.trim(),
          role: profileData.role || 'staff'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Usuario creado",
        description: "El nuevo usuario ha sido creado exitosamente"
      });

      return data;

    } catch (err) {
      console.error('Error creating profile:', err);
      toast({
        title: "Error",
        description: "No se pudo crear el nuevo usuario",
        variant: "destructive"
      });
      return null;
    } finally {
      setCreating(false);
    }
  }, [toast]);

  /**
   * Verificar si un email está disponible
   */
  const checkEmailAvailability = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned = email available
        return true;
      }

      return !data; // If data exists, email is not available

    } catch (err) {
      console.error('Error checking email availability:', err);
      return false;
    }
  }, []);

  return {
    creating,
    createProfile,
    checkEmailAvailability
  };
};
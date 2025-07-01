import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface CreateUserData {
  email: string;
  password?: string;
  fullName: string;
  role: string;
}

interface InviteUserData {
  email: string;
  fullName: string;
  role: string;
}

export const useUserCreation = () => {
  const [loading, setLoading] = useState(false);

  const createUser = async (userData: CreateUserData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.fullName,
          role: userData.role
        }
      });

      if (error) throw error;
      
      showSuccess('Usuario creado correctamente');
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      showError('Error al crear el usuario');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (inviteData: InviteUserData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.admin.inviteUserByEmail(
        inviteData.email,
        {
          data: {
            full_name: inviteData.fullName,
            role: inviteData.role
          }
        }
      );

      if (error) throw error;
      
      showSuccess('Invitación enviada correctamente');
      return true;
    } catch (error) {
      console.error('Error inviting user:', error);
      showError('Error al enviar la invitación');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createUser,
    inviteUser
  };
};

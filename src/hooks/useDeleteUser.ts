
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      showSuccess('Usuario eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Error al eliminar el usuario');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const softDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      showSuccess('Usuario desactivado correctamente');
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      showError('Error al desactivar el usuario');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    deleteUser,
    softDeleteUser
  };
};

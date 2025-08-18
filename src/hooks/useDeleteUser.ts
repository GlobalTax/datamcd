
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export const useDeleteUser = () => {
  const { user } = useUnifiedAuth();
  const [deleting, setDeleting] = useState(false);

  const deleteUser = async (franchiseeId: string, userId: string, userName: string, restaurantId?: string) => {
    if (!user) {
      toast.error('No tienes permisos para eliminar usuarios');
      return false;
    }

    try {
      setDeleting(true);
      logger.info('Starting user deletion via admin-users endpoint', { 
        component: 'useDeleteUser',
        action: 'deleteUser',
        franchiseeId,
        userId,
        userName,
        restaurantId,
        deletedBy: user.id
      });

      // Call admin-users edge function for secure deletion
      const { data, error } = await supabase.functions.invoke('admin-users/delete', {
        body: {
          userId,
          franchiseeId,
          restaurantId,
          reason: `Eliminación solicitada por ${user.email}`
        }
      });

      if (error) {
        logger.error('Error from admin-users delete function', {
          component: 'useDeleteUser',
          error,
          targetUserId: userId
        });
        toast.error(`Error al eliminar usuario: ${error.message}`);
        return false;
      }

      if (!data?.success) {
        toast.error(data?.error || 'Error al eliminar usuario');
        return false;
      }

      toast.success(data.message || `Usuario ${userName} eliminado exitosamente`);
      return true;

    } catch (error) {
      logger.error('Error in deleteUser', {
        component: 'useDeleteUser',
        error: error as Error,
        targetUserId: userId
      });
      toast.error('Error inesperado al eliminar usuario');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    deleteUser,
    deleting
  };
};

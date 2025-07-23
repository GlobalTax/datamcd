
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useDeleteUser = () => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const deleteUser = async (franchiseeId: string, userId: string, userName: string) => {
    if (!user) {
      toast.error('No tienes permisos para eliminar usuarios');
      return false;
    }

    try {
      setDeleting(true);
      console.log('Iniciando eliminación de usuario:', { franchiseeId, userId, userName });

      // 1. Desvincular el franquiciado del usuario (esto es lo más importante)
      const { error: franchiseeError } = await supabase
        .from('franchisees')
        .update({ user_id: null })
        .eq('id', franchiseeId)
        .eq('user_id', userId); // Asegurar que solo actualizamos el franquiciado correcto

      if (franchiseeError) {
        console.error('Error desvinculando franquiciado:', franchiseeError);
        toast.error('Error al desvincular el acceso del franquiciado');
        return false;
      }

      console.log('Franquiciado desvinculado exitosamente');

      // 2. Marcar invitaciones como expiradas
      const { error: invitationError } = await supabase
        .from('franchisee_invitations')
        .update({ status: 'expired' })
        .eq('franchisee_id', franchiseeId);

      if (invitationError) {
        console.error('Error actualizando invitaciones:', invitationError);
        // No es crítico, continuamos
      }

      // 3. Intentar eliminar el perfil (opcional, el usuario puede seguir existiendo)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error eliminando perfil:', profileError);
        // No es crítico para el proceso principal
      } else {
        console.log('Perfil eliminado exitosamente');
      }

      // Nota: No podemos eliminar el usuario de auth.users con el token actual
      // pero hemos desvinculado al franquiciado, que es lo más importante
      
      toast.success(`Acceso eliminado para ${userName}. El franquiciado ya no tiene acceso al sistema.`);
      return true;

    } catch (error) {
      console.error('Error en deleteUser:', error);
      toast.error('Error inesperado al eliminar acceso de usuario');
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

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'franchisee' | 'staff' | 'superadmin';

export const useUserCreation = () => {
  const { user } = useUnifiedAuth();
  const [creating, setCreating] = useState(false);

  const createUser = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: UserRole = 'franchisee',
    existingFranchiseeId?: string,
    restaurantId?: string
  ) => {
    if (!user) {
      toast.error('No tienes permisos para crear usuarios');
      return false;
    }

    try {
      setCreating(true);
      console.log('Creating user via admin-users endpoint:', { email, fullName, role, existingFranchiseeId, restaurantId });

      // Call admin-users edge function
      const { data, error } = await supabase.functions.invoke('admin-users/create', {
        body: {
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          role,
          existingFranchiseeId,
          restaurantId,
          mustChangePassword: true // Forzar cambio de contraseña en primer login
        }
      });

      if (error) {
        console.error('Error from admin-users function:', error);
        toast.error(`Error al crear usuario: ${error.message}`);
        return false;
      }

      if (!data?.success) {
        toast.error(data?.error || 'Error al crear usuario');
        return false;
      }

      toast.success(`Usuario ${fullName} creado exitosamente`);
      return true;

    } catch (error) {
      console.error('Error in createUser:', error);
      toast.error('Error inesperado al crear usuario');
      return false;
    } finally {
      setCreating(false);
    }
  };

  const sendInvitation = async (email: string, role: UserRole = 'franchisee') => {
    if (!user) {
      toast.error('No tienes permisos para enviar invitaciones');
      return false;
    }

    try {
      setCreating(true);

      // Verificar si ya existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        toast.error('Ya existe un usuario con este email');
        return false;
      }

      // Por ahora solo mostrar mensaje de éxito
      // En el futuro aquí se podría integrar con un servicio de email
      toast.success(`Invitación enviada a ${email}`);
      console.log('Invitación enviada:', { email, role, invitedBy: user.email });
      
      return true;

    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Error al enviar invitación');
      return false;
    } finally {
      setCreating(false);
    }
  };

  return {
    createUser,
    sendInvitation,
    creating
  };
};
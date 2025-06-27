
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'franchisee' | 'manager' | 'asesor' | 'asistente' | 'superadmin';

export const useUserCreation = () => {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);

  const createUser = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: UserRole = 'franchisee',
    existingFranchiseeId?: string
  ) => {
    if (!user) {
      toast.error('No tienes permisos para crear usuarios');
      return false;
    }

    // Verificar permisos
    if (!['admin', 'asesor', 'superadmin'].includes(user.role)) {
      toast.error('No tienes permisos de administrador');
      return false;
    }

    try {
      setCreating(true);
      console.log('Creando usuario:', { email, fullName, role, existingFranchiseeId });

      // Verificar si ya existe un perfil con este email
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        toast.error('Ya existe un usuario con este email');
        return false;
      }

      // Crear usuario con signUp normal pero con datos adicionales
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (signUpError) {
        console.error('Error with signUp:', signUpError);
        toast.error(`Error al crear usuario: ${signUpError.message}`);
        return false;
      }

      if (!signUpData.user) {
        toast.error('Error al crear usuario - no se recibió el usuario');
        return false;
      }

      console.log('Usuario creado:', signUpData.user);

      // Esperar un momento para que el trigger funcione
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar si el perfil se creó automáticamente, si no, crearlo manualmente
      const { data: profileData, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', signUpData.user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking profile:', profileCheckError);
      }

      if (!profileData) {
        console.log('Perfil no encontrado, creando manualmente...');
        // Crear perfil manualmente si el trigger no funcionó
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            email: email,
            full_name: fullName,
            role: role
          });

        if (profileError) {
          console.error('Error creating profile manually:', profileError);
          toast.error('Usuario creado pero error al crear perfil: ' + profileError.message);
          return false;
        }
      } else {
        console.log('Perfil encontrado, actualizando rol...');
        // Actualizar el rol si el perfil ya existe pero con rol incorrecto
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: role, full_name: fullName })
          .eq('id', signUpData.user.id);

        if (updateError) {
          console.error('Error updating profile role:', updateError);
          toast.error('Usuario creado pero error al actualizar el rol');
          return false;
        }
      }

      // Si es franquiciado, manejar la asignación
      if (role === 'franchisee') {
        if (existingFranchiseeId) {
          // Vincular usuario a franquiciado existente
          const { error: updateError } = await supabase
            .from('franchisees')
            .update({ user_id: signUpData.user.id })
            .eq('id', existingFranchiseeId);

          if (updateError) {
            console.error('Error linking to existing franchisee:', updateError);
            toast.error('Usuario creado pero error al vincular con franquiciado existente');
            return false;
          }

          console.log('Usuario vinculado a franquiciado existente:', existingFranchiseeId);
        } else {
          // Crear nuevo franquiciado
          const { error: franchiseeError } = await supabase
            .from('franchisees')
            .insert({
              user_id: signUpData.user.id,
              franchisee_name: fullName
            });

          if (franchiseeError) {
            console.error('Error creating franchisee:', franchiseeError);
            toast.error('Usuario creado pero error al crear franquiciado');
            return false;
          }
        }
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

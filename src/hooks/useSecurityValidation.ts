import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';

export const useSecurityValidation = () => {
  const { user } = useAuth();

  const validateRoleAssignment = async (targetRole: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .rpc('validate_user_role_assignment', {
          target_role: targetRole,
          assigner_role: user.role || 'user'
        });

      if (error) {
        console.error('Role validation error:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Security validation failed:', error);
      return false;
    }
  };

  const validateUserDeletion = async (targetUserId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .rpc('validate_user_deletion', {
          target_user_id: targetUserId,
          deleter_user_id: user.id
        });

      if (error) {
        console.error('Deletion validation error:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Security validation failed:', error);
      return false;
    }
  };

  const getCurrentUserRole = async (): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .rpc('get_current_user_role');

      if (error) {
        console.error('Role fetch error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
  };

  const hasRole = (requiredRoles: string[]): boolean => {
    if (!user?.role) return false;
    return requiredRoles.includes(user.role);
  };

  const isAdmin = (): boolean => {
    return hasRole(['admin', 'superadmin']);
  };

  const isSuperAdmin = (): boolean => {
    return hasRole(['superadmin']);
  };

  return {
    validateRoleAssignment,
    validateUserDeletion,
    getCurrentUserRole,
    hasRole,
    isAdmin,
    isSuperAdmin
  };
};
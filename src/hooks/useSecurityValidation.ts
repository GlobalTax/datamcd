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

  const canManageUsers = (): boolean => {
    return hasRole(['admin', 'superadmin']);
  };

  const canDeleteUser = (targetRole?: string): boolean => {
    if (!user?.role || !targetRole) return false;
    
    // Superadmin can delete anyone except other superadmins
    if (user.role === 'superadmin') {
      return targetRole !== 'superadmin';
    }
    
    // Admin can delete franchisee and staff
    if (user.role === 'admin') {
      return ['franchisee', 'staff'].includes(targetRole);
    }
    
    return false;
  };

  const canAccessSensitiveData = (): boolean => {
    return hasRole(['admin', 'superadmin']);
  };

  const validateDataAccess = async (tableName: string, recordId?: string): Promise<boolean> => {
    if (!user) return false;

    // Check for sensitive tables that require admin access
    const sensitiveDataTables = ['audit_logs', 'profiles', 'franchisee_access_log', 'franchisee_activity_log'];
    
    if (sensitiveDataTables.includes(tableName) && !canAccessSensitiveData()) {
      console.warn(`Access denied to sensitive table: ${tableName}`);
      return false;
    }

    return true;
  };

  return {
    validateRoleAssignment,
    validateUserDeletion,
    getCurrentUserRole,
    hasRole,
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canDeleteUser,
    canAccessSensitiveData,
    validateDataAccess
  };
};
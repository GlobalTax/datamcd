import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface AuditLogEntry {
  action_type: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
}

export const useSecurityAudit = () => {
  const { user } = useAuth();

  const logAction = async (entry: AuditLogEntry) => {
    if (!user?.id) return;

    try {
      // Get client IP and user agent (if available)
      const clientInfo = {
        ip_address: entry.ip_address || 'unknown',
        user_agent: entry.user_agent || navigator.userAgent,
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action_type: entry.action_type,
          table_name: entry.table_name,
          record_id: entry.record_id,
          old_values: entry.old_values,
          new_values: entry.new_values,
          ip_address: clientInfo.ip_address,
          user_agent: clientInfo.user_agent,
        });

      if (error) {
        console.error('Error logging audit entry:', error);
      }
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  };

  const logUserCreation = async (newUser: any) => {
    await logAction({
      action_type: 'user_created',
      table_name: 'profiles',
      record_id: newUser.id,
      new_values: {
        email: newUser.email,
        role: newUser.role,
        full_name: newUser.full_name,
      },
    });
  };

  const logUserDeletion = async (deletedUserId: string, deletedUserData: any) => {
    await logAction({
      action_type: 'user_deleted',
      table_name: 'profiles',
      record_id: deletedUserId,
      old_values: deletedUserData,
    });
  };

  const logRoleChange = async (userId: string, oldRole: string, newRole: string) => {
    await logAction({
      action_type: 'role_changed',
      table_name: 'profiles',
      record_id: userId,
      old_values: { role: oldRole },
      new_values: { role: newRole },
    });
  };

  const logSensitiveDataAccess = async (tableName: string, recordId?: string) => {
    await logAction({
      action_type: 'sensitive_data_access',
      table_name: tableName,
      record_id: recordId,
    });
  };

  const logFailedAuthentication = async (email: string, reason: string) => {
    await logAction({
      action_type: 'failed_authentication',
      new_values: { email, reason },
    });
  };

  const logPermissionDenied = async (resource: string, action: string) => {
    await logAction({
      action_type: 'permission_denied',
      new_values: { resource, action },
    });
  };

  // Security monitoring functions
  const checkForSuspiciousActivity = async () => {
    if (!user?.id) return;

    try {
      // Check for multiple failed logins in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: failedLogins, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('action_type', 'failed_authentication')
        .gte('created_at', oneHourAgo);

      if (error) throw error;

      if (failedLogins && failedLogins.length >= 5) {
        toast({
          title: 'Actividad sospechosa detectada',
          description: 'Se han detectado múltiples intentos de autenticación fallidos en su cuenta.',
          variant: 'destructive',
        });
        
        // Log the suspicious activity
        await logAction({
          action_type: 'suspicious_activity_detected',
          new_values: { 
            type: 'multiple_failed_logins',
            count: failedLogins.length 
          },
        });
      }
    } catch (error) {
      console.error('Error checking for suspicious activity:', error);
    }
  };

  const validateDataAccess = async (tableName: string, recordId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if user has permission to access this data
      const { data: userRole } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!userRole) return false;

      // Log the data access attempt
      await logSensitiveDataAccess(tableName, recordId);

      // Basic role-based access control
      const sensitiveDataAccess = ['admin', 'superadmin'].includes(userRole.role);
      
      if (!sensitiveDataAccess && ['audit_logs', 'profiles'].includes(tableName)) {
        await logPermissionDenied(tableName, 'read');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating data access:', error);
      return false;
    }
  };

  return {
    logAction,
    logUserCreation,
    logUserDeletion,
    logRoleChange,
    logSensitiveDataAccess,
    logFailedAuthentication,
    logPermissionDenied,
    checkForSuspiciousActivity,
    validateDataAccess,
  };
};
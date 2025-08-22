import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { toast } from 'sonner';

interface AuditLogEntry {
  action_type: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
}

export const useSecurityAudit = () => {
  const { user } = useAuth();

  const logAction = useCallback(async (entry: AuditLogEntry) => {
    if (!user?.id) return;

    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action_type: entry.action_type,
        table_name: entry.table_name,
        record_id: entry.record_id,
        old_values: entry.old_values,
        new_values: {
          ...entry.new_values,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_address: null // Will be logged server-side
        }
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }, [user]);

  const logUserCreation = useCallback(async (newUser: any) => {
    await logAction({
      action_type: 'USER_CREATED',
      table_name: 'profiles',
      record_id: newUser.id,
      new_values: {
        email: newUser.email,
        role: newUser.role,
        created_by_admin: true
      }
    });
  }, [logAction]);

  const logUserDeletion = useCallback(async (deletedUserId: string, deletedUserData: any) => {
    await logAction({
      action_type: 'USER_DELETED',
      table_name: 'profiles',
      record_id: deletedUserId,
      old_values: deletedUserData
    });
  }, [logAction]);

  const logRoleChange = useCallback(async (userId: string, oldRole: string, newRole: string) => {
    await logAction({
      action_type: 'ROLE_CHANGED',
      table_name: 'profiles',
      record_id: userId,
      old_values: { role: oldRole },
      new_values: { role: newRole }
    });
  }, [logAction]);

  const logSensitiveDataAccess = useCallback(async (tableName: string, recordId?: string) => {
    await logAction({
      action_type: 'SENSITIVE_DATA_ACCESS',
      table_name: tableName,
      record_id: recordId,
      new_values: {
        access_type: 'READ',
        user_role: user?.role
      }
    });
  }, [logAction, user]);

  const logFailedAuthentication = useCallback(async (email: string, reason: string) => {
    await logAction({
      action_type: 'FAILED_AUTHENTICATION',
      table_name: 'auth_attempts',
      record_id: email,
      new_values: {
        failure_reason: reason,
        attempt_time: new Date().toISOString()
      }
    });
  }, [logAction]);

  const logPermissionDenied = useCallback(async (resource: string, action: string) => {
    await logAction({
      action_type: 'PERMISSION_DENIED',
      table_name: resource,
      new_values: {
        attempted_action: action,
        user_role: user?.role
      }
    });
  }, [logAction, user]);

  // Enhanced security monitoring
  const checkForSuspiciousActivity = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Check for multiple failed logins in the last hour
      const { data: suspiciousActivity } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action_type', 'FAILED_AUTHENTICATION')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(10);

      if (suspiciousActivity && suspiciousActivity.length >= 5) {
        toast.error('Actividad Sospechosa Detectada: Se han detectado múltiples intentos de inicio de sesión fallidos en tu cuenta.');

        // Log security event
        await logAction({
          action_type: 'SUSPICIOUS_ACTIVITY_DETECTED',
          new_values: {
            event_type: 'multiple_failed_logins',
            count: suspiciousActivity.length,
            time_window: '1_hour'
          }
        });
      }
    } catch (error) {
      console.error('Error checking for suspicious activity:', error);
    }
  }, [user, logAction]);

  // Validate data access permissions
  const validateDataAccess = useCallback(async (tableName: string, recordId?: string): Promise<boolean> => {
    if (!user) return false;

    // Check for sensitive tables that require admin access
    const sensitiveDataTables = ['audit_logs', 'profiles', 'franchisee_access_log', 'franchisee_activity_log'];
    
    if (sensitiveDataTables.includes(tableName) && !['admin', 'superadmin'].includes(user.role || '')) {
      console.warn(`Access denied to sensitive table: ${tableName}`);
      
      await logPermissionDenied(tableName, 'READ');
      
      toast.error('Acceso Denegado: No tienes permisos para acceder a estos datos.');
      
      return false;
    }

    // Log access to sensitive data
    if (sensitiveDataTables.includes(tableName)) {
      await logSensitiveDataAccess(tableName, recordId);
    }

    return true;
  }, [user, logPermissionDenied, logSensitiveDataAccess]);

  return {
    logAction,
    logUserCreation,
    logUserDeletion,
    logRoleChange,
    logSensitiveDataAccess,
    logFailedAuthentication,
    logPermissionDenied,
    checkForSuspiciousActivity,
    validateDataAccess
  };
};
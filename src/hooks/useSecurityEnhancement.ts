import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { toast } from 'sonner';

interface SecurityEvent {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export const useSecurityEnhancement = () => {
  const { user } = useAuth();

  // Monitor for suspicious activities
  useEffect(() => {
    const checkSuspiciousActivity = async () => {
      if (!user?.id) return;

      try {
        // Check for multiple failed login attempts within an hour
        const { data: failedAttempts } = await supabase
          .from('audit_logs')
          .select('created_at')
          .eq('action_type', 'FAILED_AUTHENTICATION')
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          .limit(10);

        if (failedAttempts && failedAttempts.length >= 5) {
          await logSecurityEvent({
            type: 'suspicious_login_activity',
            description: 'Multiple failed login attempts detected within one hour',
            severity: 'high',
            metadata: {
              failed_attempts_count: failedAttempts.length,
              time_window: '1_hour',
              user_id: user.id
            }
          });
        }
      } catch (error) {
        console.error('Error checking suspicious activity:', error);
      }
    };

    // Check every 5 minutes when user is active
    const interval = setInterval(checkSuspiciousActivity, 5 * 60 * 1000);
    checkSuspiciousActivity(); // Initial check

    return () => clearInterval(interval);
  }, [user]);

  const logSecurityEvent = async (event: SecurityEvent) => {
    try {
      // Use basic audit logging since enhanced RPC may not exist yet
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action_type: 'SECURITY_EVENT',
        table_name: 'security_events',
        new_values: {
          event_type: event.type,
          description: event.description,
          severity: event.severity,
          metadata: event.metadata,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const validateUserInput = useCallback((input: string, maxLength: number = 1000) => {
    // Check for potentially malicious patterns
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /<iframe/gi,
      /document\./gi,
      /window\./gi
    ];

    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(input));
    
    if (hasSuspiciousContent) {
      logSecurityEvent({
        type: 'suspicious_input_detected',
        description: 'Potentially malicious input detected in user submission',
        severity: 'medium',
        metadata: { input_length: input.length, user_id: user?.id }
      });
      
      return {
        isValid: false,
        sanitizedInput: input.replace(/<[^>]*>/g, ''), // Basic HTML tag removal
        message: 'Input contains potentially unsafe content'
      };
    }

    if (input.length > maxLength) {
      return {
        isValid: false,
        sanitizedInput: input.substring(0, maxLength),
        message: `Input exceeds maximum length of ${maxLength} characters`
      };
    }

    // Basic HTML escaping
    const sanitizedInput = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return {
      isValid: true,
      sanitizedInput,
      message: 'Input is valid'
    };
  }, [user, logSecurityEvent]);

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const suggestions = [];

    // Length checks
    if (password.length >= 8) score++;
    else suggestions.push('Use at least 8 characters');

    if (password.length >= 12) score++;
    else suggestions.push('Consider using 12 or more characters');

    // Character type checks
    if (/[A-Z]/.test(password)) score++;
    else suggestions.push('Include at least one uppercase letter');

    if (/[a-z]/.test(password)) score++;
    else suggestions.push('Include at least one lowercase letter');

    if (/[0-9]/.test(password)) score++;
    else suggestions.push('Include at least one number');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else suggestions.push('Include at least one special character');

    let strength = 'weak';
    if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
      strength,
      score,
      suggestions
    };
  };

  const validateAdminAction = async (action: string, targetId?: string): Promise<boolean> => {
    if (!user?.id) return false;

    // Basic role validation for now
    const adminRoles = ['admin', 'superadmin'];
    const userRole = user.role || '';

    if (!adminRoles.includes(userRole)) {
      await logSecurityEvent({
        type: 'unauthorized_admin_action',
        description: `User attempted unauthorized admin action: ${action}`,
        severity: 'high',
        metadata: {
          action,
          target_id: targetId,
          user_id: user.id,
          user_role: userRole
        }
      });
      
      return false;
    }

    return true;
  };

  return {
    logSecurityEvent,
    validateUserInput,
    checkPasswordStrength,
    validateAdminAction
  };
};
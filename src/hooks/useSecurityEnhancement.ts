import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';

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
    if (!user) return;

    const checkSuspiciousActivity = async () => {
      try {
        // Check for multiple failed login attempts
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        const { data: failedAttempts, error } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('action_type', 'failed_authentication')
          .gte('created_at', oneHourAgo);

        if (error) {
          console.error('Error checking suspicious activity:', error);
          return;
        }

        if (failedAttempts && failedAttempts.length >= 3) {
          await logSecurityEvent({
            type: 'suspicious_activity_detected',
            description: `Multiple failed authentication attempts detected for user ${user.id}`,
            severity: 'high',
            metadata: {
              failedAttempts: failedAttempts.length,
              timeWindow: '1 hour'
            }
          });
        }
      } catch (error) {
        console.error('Error in security monitoring:', error);
      }
    };

    // Check on mount and periodically
    checkSuspiciousActivity();
    const interval = setInterval(checkSuspiciousActivity, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  const logSecurityEvent = async (event: SecurityEvent) => {
    try {
      await supabase.rpc('log_security_event_enhanced', {
        event_type: event.type,
        event_description: event.description,
        additional_data: {
          severity: event.severity,
          ...event.metadata
        }
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const validateUserInput = (input: string, maxLength: number = 1000): { isValid: boolean; sanitized: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '' };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i
    ];

    const containsSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(input));
    
    if (containsSuspiciousContent) {
      logSecurityEvent({
        type: 'suspicious_input_detected',
        description: 'User input contains potentially malicious content',
        severity: 'medium',
        metadata: { inputLength: input.length, userId: user?.id }
      });
    }

    // Sanitize input
    const sanitized = input
      .trim()
      .slice(0, maxLength)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return {
      isValid: !containsSuspiciousContent && input.length <= maxLength,
      sanitized
    };
  };

  const checkPasswordStrength = async (password: string): Promise<{ 
    strength: 'weak' | 'medium' | 'strong'; 
    score: number; 
    suggestions: string[] 
  }> => {
    try {
      const { data, error } = await supabase.rpc('validate_password_strength_secure', {
        password_input: password
      });

      if (error) {
        console.error('Error checking password strength:', error);
        return { strength: 'weak', score: 0, suggestions: ['Error validating password'] };
      }

      // Type the response data properly
      const result = data as { strength: 'weak' | 'medium' | 'strong'; score: number; suggestions: string[] };

      return {
        strength: result.strength,
        score: result.score,
        suggestions: result.suggestions
      };
    } catch (error) {
      console.error('Error in password strength check:', error);
      return { strength: 'weak', score: 0, suggestions: ['Error validating password'] };
    }
  };

  const validateAdminAction = async (action: string, targetId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: isValid, error } = await supabase
        .rpc('validate_admin_action_enhanced', {
          action_type: action,
          target_user_id: targetId || null,
          action_data: { timestamp: new Date().toISOString() }
        });

      if (error) {
        console.error('Error validating admin action:', error);
        return false;
      }

      return isValid || false;
    } catch (error) {
      console.error('Error in admin action validation:', error);
      return false;
    }
  };

  return {
    logSecurityEvent,
    validateUserInput,
    checkPasswordStrength,
    validateAdminAction
  };
};
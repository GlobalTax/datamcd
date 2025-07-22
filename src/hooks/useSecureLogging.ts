
import { useCallback, useEffect } from 'react';
import { secureLogger, LogContext } from '@/utils/secureLogger';
import { setupGlobalErrorHandling, consoleInterceptor } from '@/utils/logSanitizer';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';

/**
 * Hook para logging seguro en componentes React
 */
export const useSecureLogging = () => {
  const { user } = useUnifiedAuth();

  // Configurar context del usuario actual
  const createUserContext = useCallback((additionalContext?: Partial<LogContext>): LogContext => {
    return {
      userId: user?.id,
      ...additionalContext,
      timestamp: new Date().toISOString()
    };
  }, [user?.id]);

  // Métodos de logging con context automático
  const logInfo = useCallback((message: string, data?: any, context?: Partial<LogContext>) => {
    secureLogger.info(message, data, createUserContext(context));
  }, [createUserContext]);

  const logError = useCallback((message: string, error?: Error | any, context?: Partial<LogContext>) => {
    secureLogger.error(message, error, createUserContext(context));
  }, [createUserContext]);

  const logWarn = useCallback((message: string, data?: any, context?: Partial<LogContext>) => {
    secureLogger.warn(message, data, createUserContext(context));
  }, [createUserContext]);

  const logDebug = useCallback((message: string, data?: any, context?: Partial<LogContext>) => {
    secureLogger.debug(message, data, createUserContext(context));
  }, [createUserContext]);

  const logSecurity = useCallback((message: string, data?: any, context?: Partial<LogContext>) => {
    secureLogger.security(message, data, createUserContext(context));
  }, [createUserContext]);

  // Logging de eventos de usuario específicos
  const logUserAction = useCallback((action: string, entity?: string, entityId?: string, data?: any) => {
    logInfo(`User action: ${action}`, data, {
      action,
      entity,
      entityId
    });
  }, [logInfo]);

  const logApiCall = useCallback((method: string, endpoint: string, status?: number, duration?: number) => {
    const level = status && status >= 400 ? 'error' : 'info';
    const logMethod = level === 'error' ? logError : logInfo;
    
    logMethod(`API ${method} ${endpoint}`, {
      method,
      endpoint,
      status,
      duration
    });
  }, [logInfo, logError]);

  // Setup inicial solo una vez
  useEffect(() => {
    // Configurar manejo global de errores
    setupGlobalErrorHandling();
    
    // En desarrollo, habilitar interceptación de console
    if (process.env.NODE_ENV === 'development') {
      consoleInterceptor.enable();
      
      // Test de sanitización
      secureLogger.testSanitization();
      
      return () => {
        consoleInterceptor.disable();
      };
    }
  }, []);

  return {
    logInfo,
    logError,
    logWarn,
    logDebug,
    logSecurity,
    logUserAction,
    logApiCall,
    createUserContext
  };
};

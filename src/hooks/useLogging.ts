
import { useCallback } from 'react';
import { logger } from '@/utils/logger';
import { useAuth } from '@/hooks/useAuth';

export const useLogging = () => {
  const { user } = useAuth();

  const logInfo = useCallback((message: string, data?: any) => {
    logger.info(message, data, user?.id);
  }, [user?.id]);

  const logError = useCallback((message: string, data?: any) => {
    logger.error(message, data, user?.id);
  }, [user?.id]);

  const logWarn = useCallback((message: string, data?: any) => {
    logger.warn(message, data, user?.id);
  }, [user?.id]);

  const logDebug = useCallback((message: string, data?: any) => {
    logger.debug(message, data, user?.id);
  }, [user?.id]);

  const logSecurity = useCallback((message: string, data?: any) => {
    logger.security(message, data, user?.id);
  }, [user?.id]);

  return {
    logInfo,
    logError,
    logWarn,
    logDebug,
    logSecurity
  };
};


// Utilidades adicionales para sanitización de logs
import { secureLogger } from './secureLogger';

/**
 * Interceptor para console.log que sanitiza automáticamente
 */
class ConsoleInterceptor {
  private originalMethods: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };

  constructor() {
    this.originalMethods = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console)
    };
  }

  /**
   * Activa la interceptación de console methods
   */
  enable(): void {
    console.log = (...args: any[]) => {
      secureLogger.info('Console log', { args });
    };

    console.info = (...args: any[]) => {
      secureLogger.info('Console info', { args });
    };

    console.warn = (...args: any[]) => {
      secureLogger.warn('Console warn', { args });
    };

    console.error = (...args: any[]) => {
      secureLogger.error('Console error', { args });
    };

    console.debug = (...args: any[]) => {
      secureLogger.debug('Console debug', { args });
    };
  }

  /**
   * Desactiva la interceptación
   */
  disable(): void {
    console.log = this.originalMethods.log;
    console.info = this.originalMethods.info;
    console.warn = this.originalMethods.warn;
    console.error = this.originalMethods.error;
    console.debug = this.originalMethods.debug;
  }
}

export const consoleInterceptor = new ConsoleInterceptor();

/**
 * Hook para interceptar errores no capturados
 */
export const setupGlobalErrorHandling = (): void => {
  // Errores JavaScript no capturados
  window.addEventListener('error', (event) => {
    secureLogger.error('Uncaught error', {
      message: event.error?.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });

  // Promesas rechazadas no capturadas
  window.addEventListener('unhandledrejection', (event) => {
    secureLogger.error('Unhandled promise rejection', {
      reason: event.reason
    });
  });
};

/**
 * Sanitiza URLs removiendo credenciales
 */
export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    if (urlObj.username || urlObj.password) {
      urlObj.username = '[REDACTED]';
      urlObj.password = '';
    }
    return urlObj.toString();
  } catch {
    return '[INVALID_URL]';
  }
};

/**
 * Sanitiza headers HTTP
 */
export const sanitizeHeaders = (headers: Record<string, string>): Record<string, string> => {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('authorization') || 
        lowerKey.includes('cookie') || 
        lowerKey.includes('token') ||
        lowerKey.includes('api-key') ||
        lowerKey.includes('x-api-key')) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Utilidad para logging de requests HTTP
 */
export const logHttpRequest = (method: string, url: string, headers?: Record<string, string>, body?: any) => {
  secureLogger.info('HTTP Request', {
    method,
    url: sanitizeUrl(url),
    headers: headers ? sanitizeHeaders(headers) : undefined,
    hasBody: !!body,
    bodySize: body ? JSON.stringify(body).length : 0
  });
};

/**
 * Utilidad para logging de responses HTTP
 */
export const logHttpResponse = (status: number, url: string, responseTime?: number, hasError?: boolean) => {
  const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
  
  secureLogger[level]('HTTP Response', {
    status,
    url: sanitizeUrl(url),
    responseTime,
    hasError
  });
};

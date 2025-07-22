
// Logger específico para Edge Functions
export interface EdgeFunctionLogContext {
  functionName: string;
  requestId: string;
  userId?: string;
  method: string;
  path?: string;
  duration?: number;
  status?: number;
}

/**
 * Logger sanitizado para Edge Functions
 */
class EdgeFunctionLogger {
  private sanitizeCredentials(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = { ...obj };
    
    // Remover completamente campos sensibles
    const sensitiveFields = [
      'password', 'token', 'api_key', 'secret', 'credential',
      'authorization', 'cookie', 'session', 'private_key'
    ];
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    // Sanitizar URLs con credenciales
    if (sanitized.url && typeof sanitized.url === 'string') {
      sanitized.url = sanitized.url.replace(/:\/\/[^:]+:[^@]+@/, '://[REDACTED]:[REDACTED]@');
    }
    
    return sanitized;
  }

  info(message: string, context: EdgeFunctionLogContext, data?: any): void {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      function: context.functionName,
      requestId: context.requestId,
      method: context.method,
      duration: context.duration,
      status: context.status,
      data: data ? this.sanitizeCredentials(data) : undefined
    }));
  }

  error(message: string, context: EdgeFunctionLogContext, error?: any): void {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      function: context.functionName,
      requestId: context.requestId,
      method: context.method,
      status: context.status,
      error: error ? {
        name: error.name,
        message: error.message,
        // Stack trace solo en desarrollo
        stack: Deno.env.get('ENVIRONMENT') === 'development' ? error.stack : undefined
      } : undefined
    }));
  }

  warn(message: string, context: EdgeFunctionLogContext, data?: any): void {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      function: context.functionName,
      requestId: context.requestId,
      method: context.method,
      data: data ? this.sanitizeCredentials(data) : undefined
    }));
  }

  debug(message: string, context: EdgeFunctionLogContext, data?: any): void {
    // Solo en desarrollo
    if (Deno.env.get('ENVIRONMENT') === 'development') {
      console.log(JSON.stringify({
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        function: context.functionName,
        requestId: context.requestId,
        data: data ? this.sanitizeCredentials(data) : undefined
      }));
    }
  }
}

export const edgeLogger = new EdgeFunctionLogger();

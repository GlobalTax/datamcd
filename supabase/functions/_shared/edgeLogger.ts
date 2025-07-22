
// Logger compartido para todas las Edge Functions
export interface EdgeFunctionLogContext {
  functionName: string;
  requestId: string;
  userId?: string;
  method: string;
  path?: string;
  duration?: number;
  status?: number;
}

class EdgeFunctionLogger {
  private sanitizeCredentials(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = { ...obj };
    
    // Remover completamente campos sensibles
    const sensitiveFields = [
      'password', 'token', 'api_key', 'secret', 'credential',
      'authorization', 'cookie', 'session', 'private_key',
      'subscription_key', 'webhook_secret', 'database',
      'username', 'user', 'server', 'endpoint'
    ];
    
    for (const field of sensitiveFields) {
      for (const key in sanitized) {
        if (key.toLowerCase().includes(field.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        }
      }
    }
    
    // Sanitizar URLs con credenciales
    if (sanitized.url && typeof sanitized.url === 'string') {
      sanitized.url = sanitized.url.replace(/:\/\/[^:]+:[^@]+@/, '://[REDACTED]:[REDACTED]@');
    }
    
    return sanitized;
  }

  private createLogEntry(level: string, message: string, context: EdgeFunctionLogContext, data?: any) {
    return {
      level,
      timestamp: new Date().toISOString(),
      message,
      function: context.functionName,
      requestId: context.requestId,
      method: context.method,
      duration: context.duration,
      status: context.status,
      data: data ? this.sanitizeCredentials(data) : undefined
    };
  }

  info(message: string, context: EdgeFunctionLogContext, data?: any): void {
    console.log(JSON.stringify(this.createLogEntry('INFO', message, context, data)));
  }

  error(message: string, context: EdgeFunctionLogContext, error?: any): void {
    console.error(JSON.stringify(this.createLogEntry('ERROR', message, context, {
      error: error ? {
        name: error.name,
        message: error.message,
        // Stack trace solo en desarrollo
        stack: Deno.env.get('ENVIRONMENT') === 'development' ? error.stack : undefined
      } : undefined
    })));
  }

  warn(message: string, context: EdgeFunctionLogContext, data?: any): void {
    console.warn(JSON.stringify(this.createLogEntry('WARN', message, context, data)));
  }

  debug(message: string, context: EdgeFunctionLogContext, data?: any): void {
    // Solo en desarrollo
    if (Deno.env.get('ENVIRONMENT') === 'development') {
      console.log(JSON.stringify(this.createLogEntry('DEBUG', message, context, data)));
    }
  }

  security(message: string, context: EdgeFunctionLogContext, data?: any): void {
    console.warn(JSON.stringify(this.createLogEntry('SECURITY', `[SECURITY] ${message}`, context, data)));
  }
}

export const edgeLogger = new EdgeFunctionLogger();


// Edge Function Logger para Supabase Edge Functions
// Detecta automáticamente el entorno (Deno vs Node.js)

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
  functionName?: string;
  requestId?: string;
}

class EdgeFunctionLogger {
  private functionName: string;
  private requestId?: string;
  private isDeno: boolean;

  constructor(functionName: string, requestId?: string) {
    this.functionName = functionName;
    this.requestId = requestId;
    // Detectar si estamos en Deno (Edge Functions) o Node.js
    this.isDeno = typeof globalThis !== 'undefined' && 'Deno' in globalThis;
  }

  private createLogEntry(level: LogEntry['level'], message: string, metadata?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      functionName: this.functionName,
      requestId: this.requestId,
    };
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.functionName}]`;
    const requestInfo = entry.requestId ? ` [${entry.requestId}]` : '';
    const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
    
    return `${prefix}${requestInfo}: ${entry.message}${metadata}`;
  }

  info(message: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, metadata);
    console.log(this.formatMessage(entry));
  }

  warn(message: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry('warn', message, metadata);
    console.warn(this.formatMessage(entry));
  }

  error(message: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry('error', message, metadata);
    console.error(this.formatMessage(entry));
  }

  debug(message: string, metadata?: Record<string, any>) {
    const entry = this.createLogEntry('debug', message, metadata);
    console.debug(this.formatMessage(entry));
  }

  // Método específico para rate limiting
  rateLimitViolation(ip: string, endpoint: string, currentCount: number, limit: number) {
    this.warn('Rate limit violation', {
      ip,
      endpoint,
      currentCount,
      limit,
      action: 'blocked'
    });
  }

  // Método para logging de performance
  performance(operation: string, duration: number, metadata?: Record<string, any>) {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      operation,
      duration,
      ...metadata
    });
  }

  // Método para logging de autenticación
  auth(action: string, userId?: string, success: boolean = true, metadata?: Record<string, any>) {
    const level = success ? 'info' : 'warn';
    this[level](`Auth: ${action}`, {
      userId,
      success,
      action,
      ...metadata
    });
  }

  // Método específico para Edge Functions
  edgeFunction(phase: 'start' | 'end' | 'error', metadata?: Record<string, any>) {
    const message = `Edge Function ${phase}`;
    
    if (phase === 'error') {
      this.error(message, metadata);
    } else {
      this.info(message, metadata);
    }

    // En Deno, también podemos usar el sistema de logging nativo
    if (this.isDeno && typeof globalThis !== 'undefined' && 'Deno' in globalThis) {
      try {
        // Usar Deno's logging si está disponible
        const DenoGlobal = globalThis as any;
        if (DenoGlobal.Deno?.writeTextFileSync) {
          // Log a archivo si es necesario (solo en desarrollo)
          // DenoGlobal.Deno.writeTextFileSync('/tmp/edge-function.log', this.formatMessage(entry) + '\n', { append: true });
        }
      } catch (error) {
        // Silently fail if Deno logging is not available
      }
    }
  }
}

// Factory function para crear logger instances
export const createEdgeLogger = (functionName: string, requestId?: string): EdgeFunctionLogger => {
  return new EdgeFunctionLogger(functionName, requestId);
};

// Export del logger por defecto
export const edgeLogger = new EdgeFunctionLogger('default');

export type { LogEntry };
export { EdgeFunctionLogger };

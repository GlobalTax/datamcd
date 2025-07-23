
// Sistema de logging seguro con sanitización automática
export interface LogContext {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  requestId?: string;
  timestamp?: string;
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Patrones de datos sensibles que deben ser sanitizados
const SENSITIVE_PATTERNS = [
  // API Keys y tokens
  /([aA]pi[_-]?[kK]ey|[tT]oken|[aA]uthorization|[bB]earer)\s*[:=]\s*["']?([a-zA-Z0-9_-]{20,})["']?/gi,
  // Passwords
  /([pP]assword|[pP]wd|[pP]ass)\s*[:=]\s*["']?([^"'\s,}]{4,})["']?/gi,
  // Emails (parcial)
  /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  // Números de teléfono
  /(\+?[0-9]{1,4}[\s-]?)?(\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{3,4})/gi,
  // Números de tarjeta de crédito
  /\b([0-9]{4}[\s-]?){3}[0-9]{4}\b/gi,
  // JWT tokens
  /eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/gi,
  // URLs con credenciales
  /(https?:\/\/[^:\/\s]+):([^@\/\s]+)@/gi,
  // SQL injection attempts
  /(UNION|SELECT|INSERT|DELETE|UPDATE|DROP|CREATE|ALTER|EXEC)\s+/gi
];

// Campos que deben ser completamente removidos de los logs
const SENSITIVE_FIELDS = [
  'password',
  'pwd',
  'pass',
  'token',
  'api_key',
  'apiKey',
  'secret',
  'credential',
  'auth',
  'authorization',
  'bearer',
  'session',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'social_security_number',
  'bank_account',
  'credit_card',
  'ssn',
  'encrypted',
  'private_key'
];

class SecureLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Sanitiza texto eliminando datos sensibles
   */
  private sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return text;

    let sanitized = text;

    // Aplicar patrones de sanitización
    SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, (match, key, value) => {
        if (key && value) {
          const maskedValue = this.maskSensitiveValue(value);
          return `${key}: ${maskedValue}`;
        }
        return '[REDACTED]';
      });
    });

    return sanitized;
  }

  /**
   * Enmascara valores sensibles preservando algunos caracteres
   */
  private maskSensitiveValue(value: string): string {
    if (!value || value.length < 4) return '[REDACTED]';
    
    const start = value.substring(0, 2);
    const end = value.substring(value.length - 2);
    const middle = '*'.repeat(Math.max(4, value.length - 4));
    
    return `${start}${middle}${end}`;
  }

  /**
   * Sanitiza objetos removiendo campos sensibles y sanitizando valores
   */
  private sanitizeObject(obj: any, depth = 0, visited = new WeakSet()): any {
    if (depth > 10) return '[MAX_DEPTH_REACHED]';
    
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    if (obj instanceof Error) {
      return {
        name: obj.name,
        message: this.sanitizeText(obj.message),
        stack: this.isDevelopment ? this.sanitizeText(obj.stack || '') : '[REDACTED_IN_PRODUCTION]'
      };
    }
    
    // Para objetos y arrays, verificar si ya fueron visitados
    if (typeof obj === 'object' && obj !== null) {
      if (visited.has(obj)) {
        return '[CIRCULAR_REFERENCE]';
      }
      visited.add(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.slice(0, 100).map(item => this.sanitizeObject(item, depth + 1, visited));
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      const entries = Object.entries(obj).slice(0, 50);
      
      for (const [key, value] of entries) {
        const lowerKey = key.toLowerCase();
        
        // Remover campos completamente sensibles
        if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
          sanitized[key] = '[REDACTED]';
          continue;
        }
        
        // Sanitizar el valor recursivamente
        sanitized[key] = this.sanitizeObject(value, depth + 1, visited);
      }
      
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Crea contexto estructurado para logs
   */
  private createLogContext(level: LogLevel, message: string, data?: any, context?: LogContext): any {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      timestamp,
      level,
      message: this.sanitizeText(message),
      requestId,
      context: context ? this.sanitizeObject(context) : undefined,
      data: data ? this.sanitizeObject(data) : undefined,
      environment: process.env.NODE_ENV || 'unknown'
    };
  }

  /**
   * Log de depuración (solo en desarrollo)
   */
  debug(message: string, data?: any, context?: LogContext): void {
    if (!this.isDevelopment) return;
    
    const logEntry = this.createLogContext(LogLevel.DEBUG, message, data, context);
    console.debug('🔍 [DEBUG]', logEntry);
  }

  /**
   * Log informativo
   */
  info(message: string, data?: any, context?: LogContext): void {
    const logEntry = this.createLogContext(LogLevel.INFO, message, data, context);
    console.info('ℹ️ [INFO]', logEntry);
  }

  /**
   * Log de advertencia
   */
  warn(message: string, data?: any, context?: LogContext): void {
    const logEntry = this.createLogContext(LogLevel.WARN, message, data, context);
    console.warn('⚠️ [WARN]', logEntry);
  }

  /**
   * Log de error
   */
  error(message: string, error?: Error | any, context?: LogContext): void {
    const logEntry = this.createLogContext(LogLevel.ERROR, message, error, context);
    console.error('❌ [ERROR]', logEntry);
  }

  /**
   * Log de auditoría de seguridad
   */
  security(message: string, data?: any, context?: LogContext): void {
    const logEntry = this.createLogContext(LogLevel.WARN, `[SECURITY] ${message}`, data, context);
    console.warn('🔒 [SECURITY]', logEntry);
  }

  /**
   * Test de sanitización (solo para desarrollo)
   */
  testSanitization(): void {
    if (!this.isDevelopment) return;
    
    console.log('🧪 Testing log sanitization...');
    
    const testData = {
      api_key: 'sk-1234567890abcdef1234567890abcdef',
      password: 'secretPassword123',
      email: 'user@example.com',
      phone: '+1-555-123-4567',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature',
      normal_field: 'this should not be redacted',
      nested: {
        secret: 'nested_secret_value',
        api_endpoint: 'https://user:pass@api.example.com/endpoint'
      }
    };
    
    this.info('Sanitization test', testData);
    console.log('✅ Sanitization test completed');
  }
}

// Instancia global del logger
export const secureLogger = new SecureLogger();

// Re-export para compatibilidad
export default secureLogger;

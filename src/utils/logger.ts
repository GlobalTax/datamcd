
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
}

class SimpleLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private createLogEntry(level: LogLevel, message: string, data?: any, userId?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData(data),
      userId
    };
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // Simple sanitization - remove sensitive fields
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      const sensitiveFields = ['password', 'token', 'api_key', 'secret'];
      
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });
      
      return sanitized;
    }
    
    return data;
  }

  private log(level: LogLevel, message: string, data?: any, userId?: string): void {
    const entry = this.createLogEntry(level, message, data, userId);
    
    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) console.debug('🔍 [DEBUG]', entry);
        break;
      case LogLevel.INFO:
        console.info('ℹ️ [INFO]', entry);
        break;
      case LogLevel.WARN:
        console.warn('⚠️ [WARN]', entry);
        break;
      case LogLevel.ERROR:
        console.error('❌ [ERROR]', entry);
        break;
      case LogLevel.SECURITY:
        console.warn('🔒 [SECURITY]', entry);
        break;
    }
  }

  debug(message: string, data?: any, userId?: string): void {
    this.log(LogLevel.DEBUG, message, data, userId);
  }

  info(message: string, data?: any, userId?: string): void {
    this.log(LogLevel.INFO, message, data, userId);
  }

  warn(message: string, data?: any, userId?: string): void {
    this.log(LogLevel.WARN, message, data, userId);
  }

  error(message: string, data?: any, userId?: string): void {
    this.log(LogLevel.ERROR, message, data, userId);
  }

  security(message: string, data?: any, userId?: string): void {
    this.log(LogLevel.SECURITY, message, data, userId);
  }
}

export const logger = new SimpleLogger();

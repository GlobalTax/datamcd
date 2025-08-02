// === SERVICIO DE LOGGING CENTRALIZADO ===
// Sistema estructurado de logging para toda la aplicación

import { LogLevel, LogContext, LogEntry } from '@/types/domains/common';

export class LoggerService {
  private static instance: LoggerService;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      error
    };
  }

  private writeLog(entry: LogEntry): void {
    const logMessage = `[${entry.level}] ${entry.timestamp} - ${entry.message}`;
    
    switch (entry.level) {
      case 'ERROR':
        console.error(logMessage, entry.context, entry.error);
        break;
      case 'WARN':
        console.warn(logMessage, entry.context);
        break;
      case 'INFO':
        console.info(logMessage, entry.context);
        break;
      case 'DEBUG':
        console.debug(logMessage, entry.context);
        break;
      default:
        console.log(logMessage, entry.context);
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.writeLog(this.createLogEntry('ERROR', message, context, error));
  }

  warn(message: string, context?: LogContext): void {
    this.writeLog(this.createLogEntry('WARN', message, context));
  }

  info(message: string, context?: LogContext): void {
    this.writeLog(this.createLogEntry('INFO', message, context));
  }

  debug(message: string, context?: LogContext): void {
    this.writeLog(this.createLogEntry('DEBUG', message, context));
  }

  // Métodos específicos para dominios
  logUserAction(action: string, userId: string, details?: any): void {
    this.info(`User action: ${action}`, {
      component: 'UserAction',
      userId,
      action,
      ...details
    });
  }

  logApiCall(endpoint: string, method: string, duration: number, success: boolean): void {
    const level = success ? 'INFO' : 'WARN';
    const logMethod = level === 'INFO' ? this.info.bind(this) : this.warn.bind(this);
    logMethod(`API call: ${method} ${endpoint}`, {
      component: 'ApiCall',
      endpoint,
      method,
      duration: `${duration}ms`,
      success
    } as any);
  }

  logDatabaseOperation(operation: string, table: string, success: boolean, duration?: number): void {
    const level = success ? 'DEBUG' : 'ERROR';
    const logMethod = level === 'DEBUG' ? this.debug.bind(this) : this.error.bind(this);
    logMethod(`DB ${operation}: ${table}`, {
      component: 'Database',
      operation,
      table,
      success,
      duration: duration ? `${duration}ms` : undefined
    });
  }
}

// Singleton instance
export const logger = LoggerService.getInstance();
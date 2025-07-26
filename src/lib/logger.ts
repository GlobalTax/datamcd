import { LogLevel, LogContext, LogEntry } from './loggerTypes';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private currentLevel: LogLevel = this.isDevelopment ? 'DEBUG' : 'ERROR';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    return levels[level] <= levels[this.currentLevel];
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    
    switch (level) {
      case 'ERROR':
        if (error) {
          console.error(formattedMessage, error);
        } else {
          console.error(formattedMessage);
        }
        break;
      case 'WARN':
        console.warn(formattedMessage);
        break;
      case 'INFO':
        console.info(formattedMessage);
        break;
      case 'DEBUG':
        console.log(formattedMessage);
        break;
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log('ERROR', message, context, error);
  }

  warn(message: string, context?: LogContext): void {
    this.log('WARN', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('INFO', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log('DEBUG', message, context);
  }

  // Utility methods for common logging patterns
  apiError(message: string, endpoint: string, error: Error, context?: LogContext): void {
    this.error(message, { ...context, endpoint, errorMessage: error.message }, error);
  }

  userAction(action: string, userId?: string, context?: LogContext): void {
    this.info(`User action: ${action}`, { ...context, action, userId });
  }

  authError(message: string, context?: LogContext, error?: Error): void {
    this.error(`Auth Error: ${message}`, { ...context, type: 'authentication' }, error);
  }

  dataError(message: string, table: string, operation: string, context?: LogContext, error?: Error): void {
    this.error(`Data Error: ${message}`, { ...context, table, operation, type: 'database' }, error);
  }
}

export const logger = new Logger();
// === SERVICIO DE ERRORES CENTRALIZADO ===
// Gestión consistente de errores en toda la aplicación

import { LogLevel, LogContext } from '@/types/domains/common';

export class ErrorService {
  private static instance: ErrorService;

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  handleError(error: any, context?: LogContext): Error {
    const errorMessage = this.extractErrorMessage(error);
    const logContext = {
      ...context,
      originalError: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString()
    };

    // Log del error usando el servicio de logging
    this.logError(errorMessage, logContext);

    // Retornar error processado
    return new Error(errorMessage);
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    if (error?.data?.message) return error.data.message;
    return 'Ha ocurrido un error inesperado';
  }

  private logError(message: string, context: LogContext): void {
    // Usar el logger estructurado en lugar de console.error
    console.error('[ERROR]', {
      message,
      context,
      level: 'ERROR' as LogLevel
    });
  }

  // Errores específicos del dominio
  createNotFoundError(entity: string, id: string): Error {
    return new Error(`${entity} con ID ${id} no encontrado`);
  }

  createValidationError(field: string, message: string): Error {
    return new Error(`Error de validación en ${field}: ${message}`);
  }

  createPermissionError(action: string, resource: string): Error {
    return new Error(`No tienes permisos para ${action} en ${resource}`);
  }

  createDatabaseError(operation: string, table: string): Error {
    return new Error(`Error de base de datos en ${operation} de ${table}`);
  }
}

// Singleton instance
export const errorService = ErrorService.getInstance();
// === SERVICIO BASE CON PATRONES CONSISTENTES ===
// Clase base para todos los servicios del sistema

export abstract class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  protected async handleError(error: any, context: string): Promise<never> {
    console.error(`[${this.serviceName}:${context}]`, error);
    throw new Error(`Error en ${context}: ${error.message}`);
  }

  protected async executeQuery<T>(
    queryFn: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await queryFn();
    } catch (error) {
      await this.handleError(error, context);
      throw error;
    }
  }

  protected createResponse<T>(
    data: T | null = null,
    error: string | null = null
  ): ServiceResponse<T> {
    return {
      data,
      error,
      success: !error
    };
  }

  protected createPaginatedResponse<T>(
    data: T[] | null = null,
    total: number = 0,
    page: number = 1,
    limit: number = 10,
    error: string | null = null
  ): PaginatedResponse<T> {
    return {
      data,
      error,
      success: !error,
      total,
      page,
      limit
    };
  }
}

// Tipos de respuesta estandarizados
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends ServiceResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// Utility para crear respuestas consistentes
export const createResponse = <T>(
  data: T | null = null,
  error: string | null = null
): ServiceResponse<T> => ({
  data,
  error,
  success: !error
});

export const createPaginatedResponse = <T>(
  data: T[] | null = null,
  total: number = 0,
  page: number = 1,
  limit: number = 10,
  error: string | null = null
): PaginatedResponse<T> => ({
  data,
  error,
  success: !error,
  total,
  page,
  limit
});
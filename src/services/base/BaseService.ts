// Base service class con patrones consistentes
export abstract class BaseService {
  protected async handleError(error: any, context: string) {
    console.error(`[${context}]`, error);
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
}

// Tipos comunes para todos los servicios
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
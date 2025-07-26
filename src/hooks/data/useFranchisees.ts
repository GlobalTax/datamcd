import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { logger } from '@/lib/logger';
import { FranchiseeService } from '@/services/api/franchiseeService';
import { Franchisee } from '@/types/auth';

export interface UseFranchiseesReturn {
  franchisees: Franchisee[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // CRUD Operations
  create: (data: Omit<Franchisee, 'id' | 'created_at' | 'updated_at'>) => Promise<Franchisee>;
  update: (id: string, data: Partial<Franchisee>) => Promise<Franchisee>;
  delete: (id: string) => Promise<void>;
  assignRestaurant: (franchiseeId: string, baseRestaurantId: string) => Promise<void>;
  getFranchisee: (id: string) => Promise<Franchisee | null>;
}

/**
 * Hook consolidado para gestionar franquiciados.
 * Reemplaza: useFranchisees, useSimplifiedFranchisees
 */
export const useFranchisees = (): UseFranchiseesReturn => {
  const { user } = useUnifiedAuth();
  const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFranchisees = useCallback(async () => {
    if (!user || !['asesor', 'admin', 'superadmin'].includes(user.role)) {
      logger.info('User role not authorized for franchisees access', { userRole: user?.role });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      logger.info('Fetching franchisees', { userId: user.id, userRole: user.role });

      const data = await FranchiseeService.getFranchisees();
      setFranchisees(data);
      
      logger.info('Franchisees fetched successfully', { count: data.length });
      toast.success(`${data.length} franquiciados cargados`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los franquiciados';
      logger.error('Failed to fetch franchisees', { error: err });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const create = useCallback(async (data: Omit<Franchisee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newFranchisee = await FranchiseeService.createFranchisee(data);
      toast.success('Franquiciado creado exitosamente');
      await fetchFranchisees();
      return newFranchisee;
    } catch (error) {
      logger.error('Failed to create franchisee', { error, data });
      toast.error('Error al crear el franquiciado');
      throw error;
    }
  }, [fetchFranchisees]);

  const update = useCallback(async (id: string, data: Partial<Franchisee>) => {
    try {
      const updatedFranchisee = await FranchiseeService.updateFranchisee(id, data);
      toast.success('Franquiciado actualizado exitosamente');
      await fetchFranchisees();
      return updatedFranchisee;
    } catch (error) {
      logger.error('Failed to update franchisee', { error, id, data });
      toast.error('Error al actualizar el franquiciado');
      throw error;
    }
  }, [fetchFranchisees]);

  const deleteFranchisee = useCallback(async (id: string) => {
    try {
      await FranchiseeService.deleteFranchisee(id);
      toast.success('Franquiciado eliminado exitosamente');
      await fetchFranchisees();
    } catch (error) {
      logger.error('Failed to delete franchisee', { error, id });
      toast.error('Error al eliminar el franquiciado');
      throw error;
    }
  }, [fetchFranchisees]);

  const assignRestaurant = useCallback(async (franchiseeId: string, baseRestaurantId: string) => {
    try {
      await FranchiseeService.assignRestaurant(franchiseeId, baseRestaurantId);
      toast.success('Restaurante asignado exitosamente');
      await fetchFranchisees(); // Refresh para actualizar el contador de restaurantes
    } catch (error) {
      logger.error('Failed to assign restaurant', { error, franchiseeId, baseRestaurantId });
      const errorMessage = error instanceof Error ? error.message : 'Error al asignar el restaurante';
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchFranchisees]);

  const getFranchisee = useCallback(async (id: string) => {
    try {
      return await FranchiseeService.getFranchisee(id);
    } catch (error) {
      logger.error('Failed to get franchisee', { error, id });
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchFranchisees();
  }, [fetchFranchisees]);

  return {
    franchisees,
    loading,
    error,
    refetch: fetchFranchisees,
    create,
    update,
    delete: deleteFranchisee,
    assignRestaurant,
    getFranchisee
  };
};
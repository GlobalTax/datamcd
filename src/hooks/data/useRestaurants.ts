import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { logger } from '@/lib/logger';
import { 
  RestaurantService, 
  RestaurantConfig, 
  UnifiedRestaurant 
} from '@/services/api/restaurantService';
import { BaseRestaurant, FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

export interface RestaurantStats {
  total: number;
  assigned: number;
  available: number;
}

export interface UseRestaurantsReturn {
  restaurants: UnifiedRestaurant[] | BaseRestaurant[] | FranchiseeRestaurant[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  stats: RestaurantStats;
  // CRUD Operations
  create: (data: Omit<BaseRestaurant, 'id' | 'created_at' | 'updated_at'>) => Promise<BaseRestaurant>;
  update: (id: string, data: Partial<BaseRestaurant>) => Promise<BaseRestaurant>;
  delete: (id: string) => Promise<void>;
  assign: (franchiseeId: string, baseRestaurantId: string, assignmentData?: Partial<FranchiseeRestaurant>) => Promise<FranchiseeRestaurant>;
}

/**
 * Hook consolidado para gestionar restaurantes.
 * Reemplaza: useFranchiseeRestaurants, useOptimizedFranchiseeRestaurants, 
 * useUnifiedRestaurants, useBaseRestaurants, useSimplifiedFranchiseeRestaurants
 */
export const useRestaurants = (config: RestaurantConfig = {}): UseRestaurantsReturn => {
  const { user } = useUnifiedAuth();
  const [restaurants, setRestaurants] = useState<UnifiedRestaurant[] | BaseRestaurant[] | FranchiseeRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    if (!user) {
      logger.info('No user found, skipping restaurant fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      logger.info('Fetching restaurants with config', { 
        config, 
        userId: user.id, 
        userRole: user.role 
      });

      let data: UnifiedRestaurant[] | BaseRestaurant[] | FranchiseeRestaurant[];

      // Determinar qué tipo de datos necesitamos basado en la configuración
      if (config.includeBase && config.includeAssignments) {
        // Caso: Vista unificada (para asesores/admins)
        data = await RestaurantService.getUnifiedRestaurants();
      } else if (config.includeBase && !config.includeAssignments) {
        // Caso: Solo restaurantes base
        data = await RestaurantService.getBaseRestaurants();
      } else {
        // Caso por defecto: Restaurantes del franquiciado
        const franchiseeId = config.franchiseeId;
        
        if (!franchiseeId && user.role === 'franchisee') {
          logger.warn('Franchisee user without franchisee ID');
          setError('Usuario franquiciado sin ID de franquicia');
          return;
        }

        data = await RestaurantService.getFranchiseeRestaurants(franchiseeId);
      }

      // Aplicar filtros si se proporcionan
      if (config.filters) {
        data = applyFilters(data, config.filters);
      }

      setRestaurants(data);
      logger.info('Restaurants fetched successfully', { 
        count: data.length,
        type: getDataType(config)
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los restaurantes';
      logger.error('Failed to fetch restaurants', { error: err, config });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, config]);

  const create = useCallback(async (data: Omit<BaseRestaurant, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newRestaurant = await RestaurantService.createBaseRestaurant(data);
      toast.success('Restaurante creado exitosamente');
      await fetchRestaurants();
      return newRestaurant;
    } catch (error) {
      logger.error('Failed to create restaurant', { error, data });
      toast.error('Error al crear el restaurante');
      throw error;
    }
  }, [fetchRestaurants]);

  const update = useCallback(async (id: string, data: Partial<BaseRestaurant>) => {
    try {
      const updatedRestaurant = await RestaurantService.updateBaseRestaurant(id, data);
      toast.success('Restaurante actualizado exitosamente');
      await fetchRestaurants();
      return updatedRestaurant;
    } catch (error) {
      logger.error('Failed to update restaurant', { error, id, data });
      toast.error('Error al actualizar el restaurante');
      throw error;
    }
  }, [fetchRestaurants]);

  const deleteRestaurant = useCallback(async (id: string) => {
    try {
      await RestaurantService.deleteBaseRestaurant(id);
      toast.success('Restaurante eliminado exitosamente');
      await fetchRestaurants();
    } catch (error) {
      logger.error('Failed to delete restaurant', { error, id });
      toast.error('Error al eliminar el restaurante');
      throw error;
    }
  }, [fetchRestaurants]);

  const assign = useCallback(async (franchiseeId: string, baseRestaurantId: string, assignmentData?: Partial<FranchiseeRestaurant>) => {
    try {
      const assignment = await RestaurantService.assignRestaurant(franchiseeId, baseRestaurantId, assignmentData);
      toast.success('Restaurante asignado exitosamente');
      await fetchRestaurants();
      return assignment;
    } catch (error) {
      logger.error('Failed to assign restaurant', { error, franchiseeId, baseRestaurantId });
      toast.error('Error al asignar el restaurante');
      throw error;
    }
  }, [fetchRestaurants]);

  // Calcular estadísticas
  const stats: RestaurantStats = {
    total: restaurants.length,
    assigned: restaurants.filter(r => 'isAssigned' in r ? r.isAssigned : 'assignment' in r).length,
    available: restaurants.filter(r => 'isAssigned' in r ? !r.isAssigned : !('assignment' in r)).length
  };

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants,
    stats,
    create,
    update,
    delete: deleteRestaurant,
    assign
  };
};

// Función auxiliar para aplicar filtros
function applyFilters(
  restaurants: any[], 
  filters: RestaurantConfig['filters']
): any[] {
  if (!filters) return restaurants;

  return restaurants.filter((restaurant: any) => {
    // Para FranchiseeRestaurant, la ciudad está en base_restaurant
    const city = restaurant.city || restaurant.base_restaurant?.city;
    const state = restaurant.state || restaurant.base_restaurant?.state;
    
    if (filters.city && city !== filters.city) return false;
    if (filters.state && state !== filters.state) return false;
    if (filters.status && 'status' in restaurant && restaurant.status !== filters.status) return false;
    return true;
  });
}

// Función auxiliar para determinar el tipo de datos
function getDataType(config: RestaurantConfig): string {
  if (config.includeBase && config.includeAssignments) return 'unified';
  if (config.includeBase && !config.includeAssignments) return 'base';
  return 'franchisee';
}
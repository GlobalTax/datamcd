// === HOOK ESPECIALIZADO PARA DATOS DE RESTAURANTES BASE ===
// Hook para gestionar la lista de restaurantes base

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { baseRestaurantService } from '@/services/restaurant/BaseRestaurantService';
import { restaurantTableService, RestaurantTableFilters } from '@/services/restaurant/RestaurantTableService';
import type { BaseRestaurant } from '@/types/franchiseeRestaurant';
import { toast } from 'sonner';

export interface BaseRestaurantsConfig {
  filters?: RestaurantTableFilters;
  enabled?: boolean;
}

export const baseRestaurantsKeys = {
  all: ['base-restaurants'] as const,
  lists: () => [...baseRestaurantsKeys.all, 'list'] as const,
  list: (config: BaseRestaurantsConfig) => [...baseRestaurantsKeys.lists(), config] as const,
};

export function useBaseRestaurants(config: BaseRestaurantsConfig = {}) {
  const queryClient = useQueryClient();

  // Query para obtener restaurantes base
  const {
    data: restaurants = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: baseRestaurantsKeys.list(config),
    queryFn: async () => {
      const response = await baseRestaurantService.getBaseRestaurants();
      if (!response.success) {
        throw new Error(response.error || 'Error fetching restaurants');
      }
      return response.data || [];
    },
    select: (data) => {
      if (!config.filters) return data;
      return restaurantTableService.filterRestaurants(data, config.filters);
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: config.enabled !== false
  });

  // Mutations para operaciones CRUD
  const createMutation = useMutation({
    mutationFn: restaurantTableService.createRestaurant.bind(restaurantTableService),
    onSuccess: (response: any) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: baseRestaurantsKeys.all });
        toast.success('Restaurante creado exitosamente');
      } else {
        toast.error(response?.error || 'Error al crear el restaurante');
      }
    },
    onError: (error) => {
      toast.error('Error inesperado al crear el restaurante');
      console.error('Create restaurant error:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      restaurantTableService.updateRestaurant(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: baseRestaurantsKeys.all });
        toast.success('Restaurante actualizado exitosamente');
      } else {
        toast.error(response.error || 'Error al actualizar el restaurante');
      }
    },
    onError: (error) => {
      toast.error('Error inesperado al actualizar el restaurante');
      console.error('Update restaurant error:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => restaurantTableService.deleteRestaurant(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: baseRestaurantsKeys.all });
        toast.success('Restaurante eliminado exitosamente');
      } else {
        toast.error(response.error || 'Error al eliminar el restaurante');
      }
    },
    onError: (error) => {
      toast.error('Error inesperado al eliminar el restaurante');
      console.error('Delete restaurant error:', error);
    },
  });

  // Estadísticas derivadas
  const stats = {
    total: restaurants.length,
    byType: restaurants.reduce((acc, r) => {
      acc[r.restaurant_type] = (acc[r.restaurant_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCity: restaurants.reduce((acc, r) => {
      acc[r.city] = (acc[r.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    withFranchisee: restaurants.filter(r => r.franchisee_name).length
  };

  return {
    // Data
    restaurants,
    stats,

    // Loading states
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Error states
    error: error as Error | null,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // Actions
    refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,

    // Utils
    isEmpty: restaurants.length === 0,
    hasData: restaurants.length > 0,
    filterRestaurants: restaurantTableService.filterRestaurants.bind(restaurantTableService),
    validateData: restaurantTableService.validateRestaurantData.bind(restaurantTableService)
  };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from '@/services';
import { toast } from '@/hooks/use-toast';
import type { Restaurant, BaseRestaurant, FranchiseeRestaurant } from '@/types/core';

// Query keys for cache management
export const restaurantKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...restaurantKeys.lists(), { filters }] as const,
  details: () => [...restaurantKeys.all, 'detail'] as const,
  detail: (id: string) => [...restaurantKeys.details(), id] as const,
};

// Configuration interface for restaurant hooks
export interface RestaurantConfig {
  includeAssignments?: boolean;
  includeBase?: boolean;
  franchiseeId?: string;
  filters?: {
    city?: string;
    state?: string;
    status?: string;
  };
}

// Statistics interface
export interface RestaurantStats {
  total: number;
  assigned: number;
  available: number;
}

// Main hook for restaurants data management
export function useRestaurants(config: RestaurantConfig = {}) {
  const queryClient = useQueryClient();

  // Query for fetching restaurants
  const {
    data: restaurants = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: restaurantKeys.list(config),
    queryFn: () => restaurantService.getRestaurants(),
    select: (data) => {
      if (!data.success || !data.data) return [];
      return applyFilters(data.data, config.filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for creating base restaurants
  const createMutation = useMutation({
    mutationFn: (restaurantData: Omit<BaseRestaurant, 'id' | 'created_at' | 'updated_at'>) =>
      restaurantService.createRestaurant(restaurantData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
        toast({
          title: "Éxito",
          description: "Restaurante creado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al crear el restaurante",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error inesperado al crear el restaurante",
        variant: "destructive",
      });
      console.error('Create restaurant error:', error);
    },
  });

  // Mutation for updating base restaurants
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BaseRestaurant> }) =>
      restaurantService.updateRestaurant(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
        toast({
          title: "Éxito",
          description: "Restaurante actualizado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al actualizar el restaurante",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error inesperado al actualizar el restaurante",
        variant: "destructive",
      });
      console.error('Update restaurant error:', error);
    },
  });

  // Mutation for deleting base restaurants
  const deleteMutation = useMutation({
    mutationFn: (id: string) => restaurantService.deleteRestaurant(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
        toast({
          title: "Éxito",
          description: "Restaurante eliminado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al eliminar el restaurante",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error inesperado al eliminar el restaurante",
        variant: "destructive",
      });
      console.error('Delete restaurant error:', error);
    },
  });

  // Mutation for assigning restaurants to franchisees
  const assignMutation = useMutation({
    mutationFn: ({ franchiseeId, baseRestaurantId }: { franchiseeId: string; baseRestaurantId: string }) =>
      restaurantService.assignRestaurant(franchiseeId, baseRestaurantId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
        toast({
          title: "Éxito",
          description: "Restaurante asignado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al asignar el restaurante",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error inesperado al asignar el restaurante",
        variant: "destructive",
      });
      console.error('Assign restaurant error:', error);
    },
  });

  // Calculate statistics
  const stats: RestaurantStats = {
    total: restaurants.length,
    assigned: restaurants.filter((r: any) => r.franchisee_id).length,
    available: restaurants.filter((r: any) => !r.franchisee_id).length,
  };

  return {
    // Data
    restaurants,
    stats,

    // Loading states (legacy compatibility)
    loading: isLoading,
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAssigning: assignMutation.isPending,

    // Error states
    error,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    assignError: assignMutation.error,

    // Actions
    refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    assign: assignMutation.mutate,
  };
}

// Helper function to apply filters
function applyFilters(restaurants: Restaurant[], filters?: RestaurantConfig['filters']): Restaurant[] {
  if (!filters) return restaurants;

  return restaurants.filter((restaurant) => {
    if (filters.city && restaurant.city !== filters.city) return false;
    if (filters.state && restaurant.state !== filters.state) return false;
    if (filters.status && restaurant.status !== filters.status) return false;
    return true;
  });
}

// Hook for a single restaurant
export function useRestaurant(id: string) {
  return useQuery({
    queryKey: restaurantKeys.detail(id),
    queryFn: () => restaurantService.getRestaurant(id),
    select: (data) => data.success ? data.data : null,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
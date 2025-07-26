import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { franchiseeService } from '@/services';
import { toast } from '@/hooks/use-toast';
import type { Franchisee } from '@/types/core';

// Query keys for cache management
export const franchiseeKeys = {
  all: ['franchisees'] as const,
  lists: () => [...franchiseeKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...franchiseeKeys.lists(), { filters }] as const,
  details: () => [...franchiseeKeys.all, 'detail'] as const,
  detail: (id: string) => [...franchiseeKeys.details(), id] as const,
};

// Configuration interface for franchisee hooks
export interface FranchiseeConfig {
  includeRestaurants?: boolean;
  includeStats?: boolean;
  filters?: {
    status?: string;
    hasRestaurants?: boolean;
  };
}

// Main hook for franchisees data management
export function useFranchisees(config: FranchiseeConfig = {}) {
  const queryClient = useQueryClient();

  // Query for fetching franchisees
  const {
    data: franchisees = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: franchiseeKeys.list(config),
    queryFn: () => franchiseeService.getFranchisees(),
    select: (data) => {
      if (!data.success || !data.data) return [];
      return applyFilters(data.data, config.filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for creating franchisees
  const createMutation = useMutation({
    mutationFn: (franchiseeData: Omit<Franchisee, 'id' | 'created_at' | 'updated_at'>) =>
      franchiseeService.createFranchisee(franchiseeData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: franchiseeKeys.all });
        toast({
          title: "Éxito",
          description: "Franquiciado creado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al crear el franquiciado",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error inesperado al crear el franquiciado",
        variant: "destructive",
      });
      console.error('Create franchisee error:', error);
    },
  });

  // Mutation for updating franchisees
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Franchisee> }) =>
      franchiseeService.updateFranchisee(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: franchiseeKeys.all });
        toast({
          title: "Éxito",
          description: "Franquiciado actualizado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al actualizar el franquiciado",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error inesperado al actualizar el franquiciado",
        variant: "destructive",
      });
      console.error('Update franchisee error:', error);
    },
  });

  // Mutation for deleting franchisees
  const deleteMutation = useMutation({
    mutationFn: (id: string) => franchiseeService.deleteFranchisee(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: franchiseeKeys.all });
        toast({
          title: "Éxito",
          description: "Franquiciado eliminado correctamente",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al eliminar el franquiciado",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error inesperado al eliminar el franquiciado",
        variant: "destructive",
      });
      console.error('Delete franchisee error:', error);
    },
  });

  return {
    // Data
    franchisees,

    // Loading states (legacy compatibility)
    loading: isLoading,
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Error states
    error,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // Actions
    refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
  };
}

// Helper function to apply filters
function applyFilters(franchisees: Franchisee[], filters?: FranchiseeConfig['filters']): Franchisee[] {
  if (!filters) return franchisees;

  return franchisees.filter((franchisee) => {
    if (filters.hasRestaurants !== undefined) {
      const hasRestaurants = (franchisee.total_restaurants || 0) > 0;
      if (filters.hasRestaurants !== hasRestaurants) return false;
    }
    return true;
  });
}

// Hook for a single franchisee
export function useFranchisee(id: string) {
  return useQuery({
    queryKey: franchiseeKeys.detail(id),
    queryFn: () => franchiseeService.getFranchisee(id),
    select: (data) => data.success ? data.data : null,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
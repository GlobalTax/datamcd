// === HOOK ESPECIALIZADO PARA DATOS DE FRANQUICIADOS ===
// Reemplaza la funcionalidad de datos de useFranchisees

import { useQuery } from '@tanstack/react-query';
import { franchiseeManagementService } from '@/services/franchisee/FranchiseeManagementService';
import type { Franchisee, FranchiseeFilters } from '@/types/domains/franchisee';

export interface FranchiseeDataConfig {
  filters?: FranchiseeFilters;
  includeStats?: boolean;
  enabled?: boolean;
}

export const franchiseeDataKeys = {
  all: ['franchisee-data'] as const,
  lists: () => [...franchiseeDataKeys.all, 'list'] as const,
  list: (config: FranchiseeDataConfig) => [...franchiseeDataKeys.lists(), config] as const,
  detail: (id: string) => [...franchiseeDataKeys.all, 'detail', id] as const,
};

export function useFranchiseeData(config: FranchiseeDataConfig = {}) {
  const {
    data: franchisees = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: franchiseeDataKeys.list(config),
    queryFn: async () => {
      const response = await franchiseeManagementService.getFranchisees();
      if (!response.success) {
        throw new Error(response.error || 'Error fetching franchisees');
      }
      return response.data || [];
    },
    select: (data) => {
      if (!config.filters) return data;
      return franchiseeManagementService.filterFranchisees(data, config.filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: config.enabled !== false
  });

  // Estadísticas derivadas
  const stats = {
    total: franchisees.length,
    withAccounts: franchisees.filter(f => f.hasAccount).length,
    withoutAccounts: franchisees.filter(f => !f.hasAccount).length,
    withRestaurants: franchisees.filter(f => (f.total_restaurants || 0) > 0).length,
    totalRestaurants: franchisees.reduce((sum, f) => sum + (f.total_restaurants || 0), 0)
  };

  return {
    // Data
    franchisees,
    stats: config.includeStats ? stats : undefined,

    // States
    isLoading,
    error: error as Error | null,

    // Actions
    refetch,

    // Utils
    isEmpty: franchisees.length === 0,
    hasData: franchisees.length > 0
  };
}

export function useFranchiseeById(id: string, enabled = true) {
  return useQuery({
    queryKey: franchiseeDataKeys.detail(id),
    queryFn: async () => {
      const response = await franchiseeManagementService.getFranchisees();
      if (!response.success) {
        throw new Error(response.error || 'Error fetching franchisee');
      }
      const franchisee = response.data?.find(f => f.id === id);
      if (!franchisee) {
        throw new Error('Franchisee not found');
      }
      return franchisee;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000
  });
}
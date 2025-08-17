import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { employeeKeys } from '@/hooks/data/useEmployees';
import { employeeService } from '@/services';
import { supabase } from '@/integrations/supabase/client';
import { BudgetService } from '@/services/api/budgetService';
import { logger } from '@/lib/logger';

export const useRestaurantPrefetch = () => {
  console.log('🏪 useRestaurantPrefetch called');
  const queryClient = useQueryClient();
  console.log('🏪 Getting user from useUnifiedAuth...');
  const { user } = useUnifiedAuth();
  console.log('🏪 useRestaurantPrefetch user:', user ? 'USER_FOUND' : 'NO_USER');

  const prefetchEmployees = useCallback(async (restaurantId: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: employeeKeys.byRestaurant(restaurantId),
        queryFn: () => employeeService.getEmployees(restaurantId),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
      logger.debug('Prefetched employees for restaurant', { restaurantId });
    } catch (error) {
      logger.warn('Failed to prefetch employees', { restaurantId, error });
    }
  }, [queryClient]);

  const prefetchProfitLoss = useCallback(async (restaurantId: string) => {
    if (!user) return;
    
    const currentYear = new Date().getFullYear();
    try {
      await queryClient.prefetchQuery({
        queryKey: ['profit-loss-data', restaurantId, currentYear, user.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('profit_loss_data')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .eq('year', currentYear)
            .order('month', { ascending: false });
          
          if (error) throw error;
          return data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
      });
      logger.debug('Prefetched P&L data for restaurant', { restaurantId, currentYear });
    } catch (error) {
      logger.warn('Failed to prefetch P&L data', { restaurantId, error });
    }
  }, [queryClient, user]);

  const prefetchBudgets = useCallback(async (restaurantId: string) => {
    if (!user) return;
    
    const currentYear = new Date().getFullYear();
    try {
      await queryClient.prefetchQuery({
        queryKey: ['annual-budgets', restaurantId, currentYear],
        queryFn: () => BudgetService.fetchAnnualBudgets(restaurantId, currentYear, user.id),
        staleTime: 15 * 60 * 1000, // 15 minutes
      });
      logger.debug('Prefetched budgets for restaurant', { restaurantId, currentYear });
    } catch (error) {
      logger.warn('Failed to prefetch budgets', { restaurantId, error });
    }
  }, [queryClient, user]);

  const prefetchIncidents = useCallback(async (restaurantId: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: ['incidents', restaurantId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('restaurant_incidents')
            .select(`
              *,
              restaurant:franchisee_restaurants!restaurant_id(
                id,
                base_restaurant:base_restaurants!base_restaurant_id(restaurant_name, site_number)
              ),
              reported_user:profiles!restaurant_incidents_reported_by_fkey(full_name),
              assigned_user:profiles!restaurant_incidents_assigned_to_fkey(full_name)
            `)
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
      logger.debug('Prefetched incidents for restaurant', { restaurantId });
    } catch (error) {
      logger.warn('Failed to prefetch incidents', { restaurantId, error });
    }
  }, [queryClient]);

  const prefetchIntegrations = useCallback(async (restaurantId: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: ['integration-configs', restaurantId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('integration_configs')
            .select('*')
            .eq('franchisee_id', restaurantId); // Note: may need different mapping
          
          if (error) throw error;
          return data;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes - integrations change less frequently
      });
      logger.debug('Prefetched integrations for restaurant', { restaurantId });
    } catch (error) {
      logger.warn('Failed to prefetch integrations', { restaurantId, error });
    }
  }, [queryClient]);

  const prefetchRestaurantData = useCallback(async (restaurantId: string) => {
    if (!restaurantId) return;

    logger.info('Starting restaurant data prefetch', { restaurantId });
    
    // Run all prefetch operations in parallel
    await Promise.allSettled([
      prefetchEmployees(restaurantId),
      prefetchProfitLoss(restaurantId),
      prefetchBudgets(restaurantId),
      prefetchIncidents(restaurantId),
      prefetchIntegrations(restaurantId),
    ]);

    logger.info('Completed restaurant data prefetch', { restaurantId });
  }, [prefetchEmployees, prefetchProfitLoss, prefetchBudgets, prefetchIncidents, prefetchIntegrations]);

  return {
    prefetchRestaurantData,
    prefetchEmployees,
    prefetchProfitLoss,
    prefetchBudgets,
    prefetchIncidents,
    prefetchIntegrations,
  };
};
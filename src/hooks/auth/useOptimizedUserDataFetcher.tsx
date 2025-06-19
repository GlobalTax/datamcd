
import { useCallback } from 'react';
import { useOptimizedProfileFetcher } from './useOptimizedProfileFetcher';
import { useOptimizedFranchiseeFetcher } from './useOptimizedFranchiseeFetcher';
import { useOptimizedRestaurantsFetcher } from './useOptimizedRestaurantsFetcher';

export const useOptimizedUserDataFetcher = () => {
  const { fetchUserProfile } = useOptimizedProfileFetcher();
  const { fetchFranchiseeData } = useOptimizedFranchiseeFetcher();
  const { fetchRestaurantsData } = useOptimizedRestaurantsFetcher();

  const fetchUserData = useCallback(async (userId: string) => {
    console.log('useOptimizedUserDataFetcher - Starting optimized fetch for user:', userId);
    
    try {
      // 1. Obtener perfil del usuario (ahora optimizado)
      const profile = await fetchUserProfile(userId);
      
      let franchisee = null;
      let restaurants = [];

      // 2. Si es franchisee, obtener datos del franquiciado
      if (profile.role === 'franchisee') {
        console.log('useOptimizedUserDataFetcher - User is franchisee, fetching optimized franchisee data');
        franchisee = await fetchFranchiseeData(userId);
        
        if (franchisee) {
          console.log('useOptimizedUserDataFetcher - About to fetch optimized restaurants for franchisee:', franchisee.id);
          restaurants = await fetchRestaurantsData(franchisee.id);
        }
      }

      const userData = {
        ...profile,
        franchisee,
        restaurants
      };

      console.log('useOptimizedUserDataFetcher - Optimized user data fetch completed successfully');
      return userData;
    } catch (error) {
      console.error('useOptimizedUserDataFetcher - Error fetching optimized user data:', error);
      
      return {
        id: userId,
        email: 'user@example.com',
        full_name: 'Usuario',
        role: 'franchisee',
        franchisee: null,
        restaurants: []
      };
    }
  }, [fetchUserProfile, fetchFranchiseeData, fetchRestaurantsData]);

  return { fetchUserData };
};

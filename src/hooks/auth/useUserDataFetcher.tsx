
import { useCallback } from 'react';
import { useProfileFetcher } from './useProfileFetcher';
import { useFranchiseeFetcher } from './useFranchiseeFetcher';
import { useRestaurantsFetcher } from './useRestaurantsFetcher';

export const useUserDataFetcher = () => {
  const { fetchUserProfile } = useProfileFetcher();
  const { fetchFranchiseeData } = useFranchiseeFetcher();
  const { fetchRestaurantsData } = useRestaurantsFetcher();

  const fetchUserData = useCallback(async (userId: string) => {
    console.log('fetchUserData - Starting fetch for user:', userId);
    
    try {
      // 1. Obtener perfil del usuario
      const profile = await fetchUserProfile(userId);
      
      let franchisee = null;
      let restaurants = [];

      // 2. Si es franchisee, obtener datos del franquiciado
      if (profile.role === 'franchisee') {
        console.log('fetchUserData - User is franchisee, fetching franchisee data');
        franchisee = await fetchFranchiseeData(userId);
        
        if (franchisee) {
          console.log('fetchUserData - About to fetch restaurants for franchisee:', franchisee.id);
          restaurants = await fetchRestaurantsData(franchisee.id);
        }
      }

      const userData = {
        ...profile,
        franchisee,
        restaurants
      };

      console.log('fetchUserData - User data fetch completed successfully');
      return userData;
    } catch (error) {
      console.error('fetchUserData - Error fetching user data:', error);
      
      // Devolver datos básicos en caso de error completo
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

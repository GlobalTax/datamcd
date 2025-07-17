
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
      // Fetch directo sin timeout para mayor confiabilidad
      const profile = await fetchUserProfile(userId);
      
      if (!profile) {
        console.log('useOptimizedUserDataFetcher - No profile returned from fetcher');
        return null;
      }
      
      let franchisee = null;
      let restaurants = [];

      // 2. Si es franchisee, obtener datos del franquiciado sin timeout para mayor confiabilidad
      if (profile.role === 'franchisee') {
        console.log('useOptimizedUserDataFetcher - User is franchisee, fetching optimized franchisee data');
        
        try {
          franchisee = await fetchFranchiseeData(userId);
          
          if (franchisee && !franchisee.id.startsWith('temp-')) {
            console.log('useOptimizedUserDataFetcher - About to fetch optimized restaurants for franchisee:', franchisee.id);
            
            try {
              restaurants = await fetchRestaurantsData(franchisee.id);
            } catch (restaurantError) {
              console.log('useOptimizedUserDataFetcher - Restaurant fetch failed, using empty array:', restaurantError);
              restaurants = [];
            }
          }
        } catch (franchiseeError) {
          console.log('useOptimizedUserDataFetcher - Franchisee fetch failed, creating basic profile:', franchiseeError);
          franchisee = {
            id: `basic-${userId}`,
            user_id: userId,
            franchisee_name: profile.full_name || 'Usuario',
            company_name: 'Mi Empresa',
            total_restaurants: 0
          };
        }
      }

      const userData = {
        ...profile,
        franchisee,
        restaurants: restaurants || []
      };

      console.log('useOptimizedUserDataFetcher - Optimized user data fetch completed successfully');
      return userData;
    } catch (error) {
      console.error('useOptimizedUserDataFetcher - Critical error, returning null to use session data:', error);
      
      return null; // Devolver null para que useUnifiedAuth use datos de sesión
    }
  }, [fetchUserProfile, fetchFranchiseeData, fetchRestaurantsData]);

  return { fetchUserData };
};

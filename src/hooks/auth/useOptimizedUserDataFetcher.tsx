
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
      // Fetch con timeout más generoso
      const profilePromise = fetchUserProfile(userId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User data fetch timeout')), 10000)
      );

      const profile = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      let franchisee = null;
      let restaurants = [];

      // 2. Si es franchisee, obtener datos del franquiciado con timeout independiente
      if (profile.role === 'franchisee') {
        console.log('useOptimizedUserDataFetcher - User is franchisee, fetching optimized franchisee data');
        
        try {
          const franchiseePromise = fetchFranchiseeData(userId);
          const franchiseeTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Franchisee fetch timeout')), 8000)
          );
          
          franchisee = await Promise.race([franchiseePromise, franchiseeTimeout]) as any;
          
          if (franchisee && !franchisee.id.startsWith('temp-')) {
            console.log('useOptimizedUserDataFetcher - About to fetch optimized restaurants for franchisee:', franchisee.id);
            
            try {
              const restaurantsPromise = fetchRestaurantsData(franchisee.id);
              const restaurantsTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Restaurants fetch timeout')), 6000)
              );
              
              restaurants = await Promise.race([restaurantsPromise, restaurantsTimeout]) as any;
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

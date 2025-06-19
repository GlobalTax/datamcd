
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRestaurantsFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchRestaurantsData = useCallback(async (franchiseeId: string) => {
    console.log('fetchRestaurantsData - Starting for franchisee:', franchiseeId);
    setIsLoading(true);
    
    try {
      // Si es un franchisee temporal, no intentar cargar restaurantes
      if (franchiseeId.startsWith('temp-')) {
        console.log('fetchRestaurantsData - Temporary franchisee, skipping restaurants');
        return [];
      }

      // Timeout más corto para restaurantes
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Restaurants query timeout')), 5000)
      );
      
      const queryPromise = supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants(*)
        `)
        .eq('franchisee_id', franchiseeId)
        .eq('status', 'active');

      const { data: restaurants, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('fetchRestaurantsData - Database error:', error);
        throw error;
      }

      console.log('fetchRestaurantsData - Restaurants found:', restaurants);
      return restaurants || [];
    } catch (error) {
      console.log('fetchRestaurantsData - Timeout or error:', error);
      console.log('fetchRestaurantsData - Returning empty array due to timeout');
      
      // Devolver array vacío en caso de error
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchRestaurantsData, isLoading };
};

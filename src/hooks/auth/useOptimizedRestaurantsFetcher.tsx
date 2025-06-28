
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedRestaurantsFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchRestaurantsData = useCallback(async (franchiseeId: string) => {
    console.log('useOptimizedRestaurantsFetcher - Starting optimized fetch for franchisee:', franchiseeId);
    setIsLoading(true);
    
    try {
      if (franchiseeId.startsWith('temp-')) {
        console.log('useOptimizedRestaurantsFetcher - Temporary franchisee, skipping restaurants');
        return [];
      }

      // Timeout aumentado para consultas complejas con JOIN
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Optimized restaurants query timeout')), 12000)
      );
      
      // Consulta optimizada que usa los índices nuevos
      const queryPromise = supabase
        .from('franchisee_restaurants')
        .select(`
          id,
          franchisee_id,
          base_restaurant_id,
          monthly_rent,
          last_year_revenue,
          franchise_fee_percentage,
          advertising_fee_percentage,
          status,
          notes,
          base_restaurant:base_restaurants!inner(
            id,
            site_number,
            restaurant_name,
            address,
            city,
            state,
            postal_code,
            country,
            restaurant_type
          )
        `)
        .eq('franchisee_id', franchiseeId)
        .eq('status', 'active');

      const { data: restaurants, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('useOptimizedRestaurantsFetcher - Database error:', error);
        throw error;
      }

      console.log('useOptimizedRestaurantsFetcher - Restaurants found:', restaurants?.length || 0);
      return restaurants || [];
    } catch (error) {
      console.log('useOptimizedRestaurantsFetcher - Error or timeout:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchRestaurantsData, isLoading };
};

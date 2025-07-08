
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

      // Timeout aumentado para evitar franquiciados temporales
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Optimized restaurants query timeout')), 18000)
      );
      
      // Consulta corregida con la sintaxis correcta
      const queryPromise = supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurant_id (
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
      console.error('useOptimizedRestaurantsFetcher - Error detallado:', {
        error: error.message,
        franchiseeId,
        timestamp: new Date().toISOString()
      });
      
      // Fallback con datos de prueba en caso de error
      console.log('useOptimizedRestaurantsFetcher - Retornando fallback vacío');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchRestaurantsData, isLoading };
};

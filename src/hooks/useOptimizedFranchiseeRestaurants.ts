
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/notifications';

export interface BaseRestaurant {
  id: string;
  restaurant_name: string;
  site_number: string;
  address: string;
  city: string;
  opening_date: string;
  restaurant_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OptimizedFranchiseeRestaurant {
  id: string;
  franchisee_id: string;
  restaurant_id: string;
  monthly_rent: number | null;
  last_year_revenue: number | null;
  franchise_fee_percentage: number | null;
  advertising_fee_percentage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  base_restaurant: BaseRestaurant | null;
}

export const useOptimizedFranchiseeRestaurants = (franchiseeId: string | undefined) => {
  const [restaurants, setRestaurants] = useState<OptimizedFranchiseeRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    if (!franchiseeId) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('franchisee_restaurants')
        .select(`
          id,
          franchisee_id,
          base_restaurant_id,
          monthly_rent,
          last_year_revenue,
          franchise_fee_percentage,
          advertising_fee_percentage,
          notes,
          created_at,
          updated_at,
          base_restaurant:base_restaurants (
            id,
            restaurant_name,
            site_number,
            address,
            city,
            opening_date,
            restaurant_type
          )
        `)
        .eq('franchisee_id', franchiseeId);

      if (supabaseError) throw supabaseError;
      
      // Map the data to include the restaurant_id from base_restaurant_id
      const mappedData = (data || []).map(item => ({
        ...item,
        restaurant_id: item.base_restaurant_id || '', // Map base_restaurant_id to restaurant_id
        base_restaurant: item.base_restaurant ? {
          ...item.base_restaurant,
          status: 'active' // Default status
        } : null
      }));
      
      setRestaurants(mappedData);
    } catch (error) {
      console.error('Error fetching optimized franchisee restaurants:', error);
      const errorMessage = 'Error al cargar los restaurantes del franquiciado';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [franchiseeId]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants
  };
};

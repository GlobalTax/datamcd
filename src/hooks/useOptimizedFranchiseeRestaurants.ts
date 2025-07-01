
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
          assigned_at,
          status,
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
        id: item.id,
        franchisee_id: item.franchisee_id || '',
        restaurant_id: item.base_restaurant_id || '',
        monthly_rent: item.monthly_rent,
        last_year_revenue: item.last_year_revenue,
        franchise_fee_percentage: item.franchise_fee_percentage,
        advertising_fee_percentage: item.advertising_fee_percentage,
        notes: item.notes,
        created_at: item.assigned_at || new Date().toISOString(),
        updated_at: item.assigned_at || new Date().toISOString(),
        base_restaurant: item.base_restaurant ? {
          id: item.base_restaurant.id,
          restaurant_name: item.base_restaurant.restaurant_name,
          site_number: item.base_restaurant.site_number,
          address: item.base_restaurant.address,
          city: item.base_restaurant.city,
          opening_date: item.base_restaurant.opening_date,
          restaurant_type: item.base_restaurant.restaurant_type,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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

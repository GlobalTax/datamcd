import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';

interface RestaurantData {
  id: string;
  status: string;
  base_restaurant: {
    id: string;
    restaurant_name: string;
    site_number: string;
    address: string;
    city: string;
    state: string;
    country: string;
    restaurant_type: string;
    opening_date: string;
    seating_capacity: number;
    square_meters: number;
    property_type: string;
  };
  franchise_start_date: string;
  franchise_end_date: string;
  monthly_rent: number;
  last_year_revenue: number;
  franchise_fee_percentage: number;
  advertising_fee_percentage: number;
  notes: string;
}

export const useRestaurantData = (restaurantId: string) => {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { effectiveFranchisee } = useAuth();

  useEffect(() => {
    if (!restaurantId || !effectiveFranchisee?.id) {
      setLoading(false);
      return;
    }

    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('franchisee_restaurants')
          .select(`
            id,
            status,
            franchise_start_date,
            franchise_end_date,
            monthly_rent,
            last_year_revenue,
            franchise_fee_percentage,
            advertising_fee_percentage,
            notes,
            base_restaurant:base_restaurants(
              id,
              restaurant_name,
              site_number,
              address,
              city,
              state,
              country,
              restaurant_type,
              opening_date,
              seating_capacity,
              square_meters,
              property_type
            )
          `)
          .eq('id', restaurantId)
          .eq('franchisee_id', effectiveFranchisee.id)
          .maybeSingle();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!data) {
          throw new Error(`Restaurante ${restaurantId} no encontrado para el franchisee actual. Puede que no tengas acceso o que el restaurante no exista.`);
        }

        setRestaurant(data as any);
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [restaurantId, effectiveFranchisee?.id]);

  const refetch = () => {
    if (restaurantId && effectiveFranchisee?.id) {
      const fetchRestaurantData = async () => {
        try {
          setLoading(true);
          setError(null);

          const { data, error: fetchError } = await supabase
            .from('franchisee_restaurants')
            .select(`
              id,
              status,
              franchise_start_date,
              franchise_end_date,
              monthly_rent,
              last_year_revenue,
              franchise_fee_percentage,
              advertising_fee_percentage,
              notes,
              base_restaurant:base_restaurants(
                id,
                restaurant_name,
                site_number,
                address,
                city,
                state,
                country,
                restaurant_type,
                opening_date,
                seating_capacity,
                square_meters,
                property_type
              )
            `)
            .eq('id', restaurantId)
            .eq('franchisee_id', effectiveFranchisee.id)
            .maybeSingle();

          if (fetchError) {
            throw new Error(fetchError.message);
          }

          setRestaurant(data as any);
        } catch (err) {
          console.error('Error refetching restaurant data:', err);
          setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
          setLoading(false);
        }
      };

      fetchRestaurantData();
    }
  };

  return {
    restaurant,
    loading,
    error,
    refetch
  };
};
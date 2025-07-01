import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';
import { showError } from '@/utils/notifications';

export const useFranchiseeRestaurants = () => {
  const { franchisee } = useAuth();
  const [restaurants, setRestaurants] = useState<FranchiseeRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async () => {
    if (!franchisee?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants (*)
        `)
        .eq('franchisee_id', franchisee.id);

      if (error) throw error;
      
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching franchisee restaurants:', error);
      showError('Error al cargar los restaurantes del franquiciado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [franchisee?.id]);

  return {
    restaurants,
    loading,
    refetch: fetchRestaurants
  };
};

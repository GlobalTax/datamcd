import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface BaseRestaurant {
  id: string;
  restaurant_name: string;
  site_number: string;
  address: string;
  city: string;
  opening_date: string;
  restaurant_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const useBaseRestaurants = () => {
  const [restaurants, setRestaurants] = useState<BaseRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('base_restaurants')
        .select('*')
        .order('restaurant_name');

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      showError('Error al cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const createRestaurant = async (restaurantData: Omit<BaseRestaurant, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('base_restaurants')
        .insert(restaurantData);

      if (error) throw error;
      
      showSuccess('Restaurante creado correctamente');
      await fetchRestaurants();
    } catch (error) {
      console.error('Error creating restaurant:', error);
      showError('Error al crear el restaurante');
    }
  };

  const updateRestaurant = async (id: string, updates: Partial<BaseRestaurant>) => {
    try {
      const { error } = await supabase
        .from('base_restaurants')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      showSuccess('Restaurante actualizado correctamente');
      await fetchRestaurants();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      showError('Error al actualizar el restaurante');
    }
  };

  const deleteRestaurant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('base_restaurants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showSuccess('Restaurante eliminado correctamente');
      await fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      showError('Error al eliminar el restaurante');
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return {
    restaurants,
    loading,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    refetch: fetchRestaurants
  };
};

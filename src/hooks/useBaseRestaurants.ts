
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

export interface BaseRestaurant {
  id: string;
  site_number: string;
  restaurant_name: string;
  city: string;
  address: string;
  state?: string;
  postal_code?: string;
  country?: string;
  autonomous_community?: string;
  property_type?: string;
  restaurant_type?: string;
  square_meters?: number;
  seating_capacity?: number;
  opening_date?: string;
  franchisee_name?: string;
  franchisee_email?: string;
  company_tax_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  status: string;
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

      // Map data to include required status field
      const mappedData = (data || []).map(item => ({
        ...item,
        status: 'active' // Default status since it's not in the database
      }));

      setRestaurants(mappedData);
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
        .insert({
          ...restaurantData,
          // Don't include status as it's not in the database
          status: undefined
        });

      if (error) throw error;

      showSuccess('Restaurante creado correctamente');
      await fetchRestaurants();
    } catch (error) {
      console.error('Error creating restaurant:', error);
      showError('Error al crear el restaurante');
    }
  };

  const updateRestaurant = async (id: string, restaurantData: Partial<BaseRestaurant>) => {
    try {
      const { error } = await supabase
        .from('base_restaurants')
        .update({
          ...restaurantData,
          // Don't include status as it's not in the database
          status: undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      showSuccess('Restaurante actualizado correctamente');
      await fetchRestaurants();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      showError('Error al actualizar el restaurante');
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
    refetch: fetchRestaurants
  };
};

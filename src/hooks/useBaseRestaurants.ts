import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';

export const useBaseRestaurants = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    if (!user) {
      console.log('User not authenticated for base restaurants');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching base restaurants for user:', user.id);

      const { data, error } = await supabase
        .from('base_restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching base restaurants:', error);
        setError(error.message);
      } else {
        console.log('Base restaurants fetched successfully:', data?.length);
        setRestaurants(data || []);
      }
    } catch (error: any) {
      console.error('Unexpected error in fetchRestaurants:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [user]);

  const refetch = () => {
    fetchRestaurants();
  };

  const addRestaurant = async (restaurantData: any) => {
    try {
      const { data, error } = await supabase
        .from('base_restaurants')
        .insert([restaurantData])
        .select()
        .single();

      if (error) {
        console.error('Error adding restaurant:', error);
        throw error;
      }

      console.log('Restaurant added successfully:', data);
      await refetch();
      return data;
    } catch (error) {
      console.error('Error in addRestaurant:', error);
      throw error;
    }
  };

  const updateRestaurant = async (id: string, restaurantData: any) => {
    try {
      const { data, error } = await supabase
        .from('base_restaurants')
        .update(restaurantData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating restaurant:', error);
        throw error;
      }

      console.log('Restaurant updated successfully:', data);
      await refetch();
      return data;
    } catch (error) {
      console.error('Error in updateRestaurant:', error);
      throw error;
    }
  };

  const deleteRestaurant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('base_restaurants')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting restaurant:', error);
        throw error;
      }

      console.log('Restaurant deleted successfully');
      await refetch();
    } catch (error) {
      console.error('Error in deleteRestaurant:', error);
      throw error;
    }
  };

  const getUserRole = () => {
    if (!user) {
      return null;
    }
    return 'superadmin'; // Simplificado
  };

  return {
    restaurants,
    loading,
    error,
    refetch,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getUserRole
  };
};
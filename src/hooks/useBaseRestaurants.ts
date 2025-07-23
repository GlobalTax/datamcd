
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BaseRestaurant } from '@/types/franchiseeRestaurant';
import { toast } from 'sonner';

export const useBaseRestaurants = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<BaseRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBaseRestaurants = async () => {
    console.log('useBaseRestaurants - Starting fetch for role:', user?.role);
    
    try {
      if (!user) {
        console.log('useBaseRestaurants - No user found');
        setLoading(false);
        return;
      }

      if (!['admin', 'superadmin'].includes(user.role)) {
        console.log('useBaseRestaurants - User role not authorized:', user.role);
        setError('No tienes permisos para ver los restaurantes base');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      console.log('useBaseRestaurants - Fetching base restaurants');

      const { data, error } = await supabase
        .from('base_restaurants')
        .select('*')
        .order('site_number', { ascending: true });

      console.log('useBaseRestaurants - Query result:', { data: data?.length || 0, error });

      if (error) {
        console.error('Error fetching base restaurants:', error);
        setError(`Error al cargar restaurantes: ${error.message}`);
        setRestaurants([]);
        toast.error('Error al cargar restaurantes: ' + error.message);
        return;
      }

      const validRestaurants = Array.isArray(data) ? data : [];
      console.log('useBaseRestaurants - Setting restaurants:', validRestaurants.length);
      setRestaurants(validRestaurants);
      
      if (validRestaurants.length === 0) {
        console.log('useBaseRestaurants - No restaurants found');
        toast.info('No se encontraron restaurantes base');
      } else {
        console.log(`useBaseRestaurants - Found ${validRestaurants.length} base restaurants`);
      }
    } catch (err) {
      console.error('Error in fetchBaseRestaurants:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los restaurantes';
      setError(errorMessage);
      setRestaurants([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useBaseRestaurants useEffect triggered, user:', user);
    fetchBaseRestaurants();
  }, [user?.id, user?.role]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchBaseRestaurants
  };
};

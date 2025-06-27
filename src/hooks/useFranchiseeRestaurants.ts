import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/AuthProvider';
import { RestaurantQueryData } from '@/types/valuationData';
import { toast } from 'sonner';

export const useFranchiseeRestaurants = () => {
  const { user, franchisee, restaurants: authRestaurants } = useAuth();
  const [restaurants, setRestaurants] = useState<RestaurantQueryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    console.log('useFranchiseeRestaurants - fetchRestaurants started');
    console.log('useFranchiseeRestaurants - User:', user ? { id: user.id, role: user.role } : null);
    console.log('useFranchiseeRestaurants - Franchisee:', franchisee ? { id: franchisee.id, name: franchisee.franchisee_name } : null);
    
    try {
      if (!user) {
        console.log('useFranchiseeRestaurants - No user found');
        setRestaurants([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (user.role !== 'franchisee') {
        console.log('useFranchiseeRestaurants - User is not franchisee, role:', user.role);
        setRestaurants([]);
        setError('Usuario no es franquiciado');
        setLoading(false);
        return;
      }

      if (!franchisee) {
        console.log('useFranchiseeRestaurants - No franchisee data found for user');
        setRestaurants([]);
        setError('No se encontró información del franquiciado');
        setLoading(false);
        return;
      }

      // Si es un franquiciado temporal, usar datos del contexto de autenticación
      if (franchisee.id.startsWith('temp-')) {
        console.log('useFranchiseeRestaurants - Temporary franchisee detected, skipping database query');
        
        // Para franquiciados temporales, crear un array vacío ya que no tienen restaurantes reales
        console.log('useFranchiseeRestaurants - No restaurants for temporary franchisee');
        setRestaurants([]);
        toast.info('No se encontraron restaurantes asignados');
        
        setError(null);
        setLoading(false);
        return;
      }

      // Para franquiciados reales, consultar la base de datos
      setLoading(true);
      setError(null);

      console.log('useFranchiseeRestaurants - Fetching restaurants for real franchisee:', franchisee.id);

      const { data, error } = await supabase
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
            restaurant_type,
            square_meters,
            seating_capacity,
            franchisee_name,
            franchisee_email,
            company_tax_id,
            opening_date,
            property_type,
            autonomous_community,
            created_at,
            updated_at,
            created_by
          )
        `)
        .eq('franchisee_id', franchisee.id)
        .eq('status', 'active');

      console.log('useFranchiseeRestaurants - Query result:', { data: data?.length || 0, error });

      if (error) {
        console.error('Error fetching restaurants:', error);
        setError(`Error al cargar restaurantes: ${error.message}`);
        setRestaurants([]);
        toast.error('Error al cargar restaurantes: ' + error.message);
        return;
      }

      const validRestaurants = Array.isArray(data) ? data : [];
      console.log('useFranchiseeRestaurants - Setting restaurants:', validRestaurants.length);
      setRestaurants(validRestaurants);
      
      if (validRestaurants.length === 0) {
        console.log('useFranchiseeRestaurants - No restaurants found for franchisee');
        toast.info('No se encontraron restaurantes asignados');
      } else {
        console.log(`useFranchiseeRestaurants - Found ${validRestaurants.length} restaurants`);
        toast.success(`Se cargaron ${validRestaurants.length} restaurantes`);
      }
    } catch (err) {
      console.error('Error in fetchRestaurants:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los restaurantes';
      setError(errorMessage);
      setRestaurants([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, franchisee?.id]);

  useEffect(() => {
    console.log('useFranchiseeRestaurants - useEffect triggered');
    fetchRestaurants();
  }, [user?.id, franchisee?.id]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants
  };
};

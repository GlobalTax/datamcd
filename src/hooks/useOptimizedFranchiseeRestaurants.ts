
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';
import { toast } from 'sonner';

export const useOptimizedFranchiseeRestaurants = () => {
  const { user, franchisee } = useAuth();
  const [restaurants, setRestaurants] = useState<FranchiseeRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimizedRestaurants = async () => {
    console.log('useOptimizedFranchiseeRestaurants - Starting optimized fetch');
    console.log('useOptimizedFranchiseeRestaurants - User:', user ? { id: user.id, role: user.role } : null);
    console.log('useOptimizedFranchiseeRestaurants - Franchisee:', franchisee ? { id: franchisee.id, name: franchisee.franchisee_name } : null);
    
    try {
      if (!user) {
        console.log('useOptimizedFranchiseeRestaurants - No user found');
        setRestaurants([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (user.role !== 'franchisee') {
        console.log('useOptimizedFranchiseeRestaurants - User is not franchisee, role:', user.role);
        setRestaurants([]);
        setError('Usuario no es franquiciado');
        setLoading(false);
        return;
      }

      if (!franchisee) {
        console.log('useOptimizedFranchiseeRestaurants - No franchisee data found for user');
        setRestaurants([]);
        setError('No se encontró información del franquiciado');
        setLoading(false);
        return;
      }

      if (franchisee.id.startsWith('temp-')) {
        console.log('useOptimizedFranchiseeRestaurants - Temporary franchisee detected, skipping database query');
        setRestaurants([]);
        toast.info('No se encontraron restaurantes asignados');
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      console.log('useOptimizedFranchiseeRestaurants - Fetching optimized restaurants for franchisee:', franchisee.id);

      // Consulta optimizada que usa los nuevos índices
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          id,
          franchisee_id,
          base_restaurant_id,
          franchise_start_date,
          franchise_end_date,
          lease_start_date,
          lease_end_date,
          monthly_rent,
          franchise_fee_percentage,
          advertising_fee_percentage,
          last_year_revenue,
          average_monthly_sales,
          status,
          notes,
          assigned_at,
          updated_at,
          base_restaurant:base_restaurants!inner(
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

      console.log('useOptimizedFranchiseeRestaurants - Optimized query result:', { data: data?.length || 0, error });

      if (error) {
        console.error('Error fetching optimized restaurants:', error);
        setError(`Error al cargar restaurantes: ${error.message}`);
        setRestaurants([]);
        toast.error('Error al cargar restaurantes: ' + error.message);
        return;
      }

      const validRestaurants = Array.isArray(data) ? data : [];
      console.log('useOptimizedFranchiseeRestaurants - Setting optimized restaurants:', validRestaurants.length);
      setRestaurants(validRestaurants);
      
      if (validRestaurants.length === 0) {
        console.log('useOptimizedFranchiseeRestaurants - No restaurants found for franchisee');
        toast.info('No se encontraron restaurantes asignados');
      } else {
        console.log(`useOptimizedFranchiseeRestaurants - Found ${validRestaurants.length} restaurants`);
        toast.success(`Se cargaron ${validRestaurants.length} restaurantes`);
      }
    } catch (err) {
      console.error('Error in optimized fetchRestaurants:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los restaurantes';
      setError(errorMessage);
      setRestaurants([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useOptimizedFranchiseeRestaurants - useEffect triggered');
    fetchOptimizedRestaurants();
  }, [user?.id, franchisee?.id]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchOptimizedRestaurants
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';
import { toast } from 'sonner';

export const useAllRestaurants = () => {
  const { user } = useUnifiedAuth();
  const [restaurants, setRestaurants] = useState<FranchiseeRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRestaurants = async () => {
    console.log('useAllRestaurants - Starting fetch for role:', user?.role);
    
    try {
      if (!user) {
        console.log('useAllRestaurants - No user found');
        setRestaurants([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Solo superadmin y admin pueden ver todos los restaurantes
      if (!['admin', 'superadmin'].includes(user.role)) {
        console.log('useAllRestaurants - User role not authorized:', user.role);
        setRestaurants([]);
        setError('No tienes permisos para ver todos los restaurantes');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      console.log('useAllRestaurants - Fetching all restaurants for admin/superadmin');

      // Consulta para obtener TODOS los restaurantes con sus franquiciados
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
          ),
          franchisees(
            id,
            franchisee_name,
            company_name,
            tax_id,
            city,
            state
          )
        `)
        .order('assigned_at', { ascending: false });

      console.log('useAllRestaurants - Query result:', { data: data?.length || 0, error });

      if (error) {
        console.error('Error fetching all restaurants:', error);
        setError(`Error al cargar restaurantes: ${error.message}`);
        setRestaurants([]);
        toast.error('Error al cargar restaurantes: ' + error.message);
        return;
      }

      const validRestaurants = Array.isArray(data) ? data : [];
      console.log('useAllRestaurants - Setting restaurants:', validRestaurants.length);
      setRestaurants(validRestaurants);
      
      if (validRestaurants.length === 0) {
        console.log('useAllRestaurants - No restaurants found');
        toast.info('No se encontraron restaurantes en la base de datos');
      } else {
        console.log(`useAllRestaurants - Found ${validRestaurants.length} restaurants`);
        toast.success(`Se cargaron ${validRestaurants.length} restaurantes`);
      }
    } catch (err) {
      console.error('Error in fetchAllRestaurants:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los restaurantes';
      setError(errorMessage);
      setRestaurants([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAllRestaurants - useEffect triggered');
    fetchAllRestaurants();
  }, [user?.id, user?.role]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchAllRestaurants
  };
};

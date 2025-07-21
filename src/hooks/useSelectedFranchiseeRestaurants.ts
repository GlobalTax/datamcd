
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFranchiseeContext } from '@/contexts/FranchiseeContext';
import { useAuth } from '@/hooks/auth/AuthProvider';

export const useSelectedFranchiseeRestaurants = () => {
  const { selectedFranchisee, isLoading: franchiseeLoading } = useFranchiseeContext();
  const { user, loading: authLoading } = useAuth();

  const {
    data: restaurants = [],
    isLoading: queryLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['restaurants', selectedFranchisee?.id],
    queryFn: async () => {
      if (!selectedFranchisee?.id) {
        console.log('useSelectedFranchiseeRestaurants - No selected franchisee');
        return [];
      }

      console.log('useSelectedFranchiseeRestaurants - Fetching restaurants for:', selectedFranchisee.franchisee_name);

      // Para IDs temporales, devolver datos mock
      if (selectedFranchisee.id.startsWith('temp-')) {
        console.log('useSelectedFranchiseeRestaurants - Using mock data for temp franchisee');
        return [
          {
            id: 'temp-restaurant-1',
            franchisee_id: selectedFranchisee.id,
            base_restaurant_id: 'temp-base-1',
            status: 'active',
            franchise_start_date: '2020-01-01',
            last_year_revenue: 1200000,
            monthly_rent: 8000,
            base_restaurant: {
              id: 'temp-base-1',
              restaurant_name: 'McDonald\'s Centro',
              site_number: 'M001',
              address: 'Calle Principal 123',
              city: 'Madrid'
            }
          }
        ];
      }

      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants(*)
        `)
        .eq('franchisee_id', selectedFranchisee.id)
        .eq('status', 'active');

      if (error) {
        console.error('useSelectedFranchiseeRestaurants - Error:', error);
        throw error;
      }

      console.log(`useSelectedFranchiseeRestaurants - Loaded ${data?.length || 0} restaurants`);
      return data || [];
    },
    enabled: !authLoading && !franchiseeLoading && !!selectedFranchisee && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const loading = authLoading || franchiseeLoading || queryLoading;

  return {
    restaurants,
    loading,
    isLoading: loading,
    error,
    refetch,
    selectedFranchisee
  };
};

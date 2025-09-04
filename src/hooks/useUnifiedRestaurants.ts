import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Tipo para la vista unified_restaurants
export interface UnifiedRestaurant {
  id: string; // franchisee_restaurant.id (principal)
  base_restaurant_id: string;
  site_number: string;
  restaurant_name: string;
  address: string;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  restaurant_type: string;
  opening_date: string | null;
  square_meters: number | null;
  seating_capacity: number | null;
  autonomous_community: string | null;
  property_type: string | null;
  status: string;
  franchisee_id: string;
  franchise_start_date: string | null;
  franchise_end_date: string | null;
  lease_start_date: string | null;
  lease_end_date: string | null;
  monthly_rent: number | null;
  franchise_fee_percentage: number | null;
  advertising_fee_percentage: number | null;
  last_year_revenue: number | null;
  average_monthly_sales: number | null;
  notes: string | null;
  franchisee_name: string;
  company_name: string | null;
  tax_id: string | null;
  franchisee_city: string | null;
  franchisee_country: string | null;
  base_created_at: string;
  assigned_at: string;
  updated_at: string;
  status_display: string;
  is_assigned: boolean;
}

export interface UnifiedRestaurantsFilters {
  search?: string;
  status?: string;
  restaurant_type?: string;
  autonomous_community?: string;
  franchisee_id?: string;
}

export const useUnifiedRestaurants = (filters: UnifiedRestaurantsFilters = {}) => {
  return useQuery({
    queryKey: ['unified-restaurants', filters],
    queryFn: async () => {
      console.log('Fetching unified restaurants with filters:', filters);
      
      let query = supabase
        .from('unified_restaurants')
        .select('*')
        .order('restaurant_name');

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`restaurant_name.ilike.%${filters.search}%,site_number.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.restaurant_type) {
        query = query.eq('restaurant_type', filters.restaurant_type);
      }

      if (filters.autonomous_community) {
        query = query.eq('autonomous_community', filters.autonomous_community);
      }

      if (filters.franchisee_id) {
        query = query.eq('franchisee_id', filters.franchisee_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching unified restaurants:', error);
        throw error;
      }

      return data as UnifiedRestaurant[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un restaurante específico por ID
export const useUnifiedRestaurant = (restaurantId: string | undefined) => {
  return useQuery({
    queryKey: ['unified-restaurant', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      
      console.log('Fetching unified restaurant:', restaurantId);
      
      const { data, error } = await supabase
        .from('unified_restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) {
        console.error('Error fetching unified restaurant:', error);
        throw error;
      }

      return data as UnifiedRestaurant;
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener restaurantes de un usuario específico
export const useUserRestaurants = () => {
  return useQuery({
    queryKey: ['user-restaurants'],
    queryFn: async () => {
      console.log('🔍 useUserRestaurants: Starting to fetch user restaurants');
      
      // First check user role
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) {
        console.error('❌ useUserRestaurants: Error fetching user profile:', profileError);
        throw profileError;
      }

      console.log('👤 useUserRestaurants: User role:', userProfile?.role);

      // If superadmin, get ALL restaurants
      if (userProfile?.role === 'superadmin' || userProfile?.role === 'admin') {
        console.log('🔑 useUserRestaurants: Fetching ALL restaurants for admin/superadmin');
        
        const { data, error } = await supabase
          .from('franchisee_restaurants')
          .select(`
            id,
            franchisee_id,
            base_restaurant:base_restaurants(
              restaurant_name,
              site_number
            )
          `)
          .eq('status', 'active');

        if (error) {
          console.error('❌ useUserRestaurants: Error fetching all restaurants:', error);
          throw error;
        }

        const formattedData = data?.map(restaurant => ({
          restaurant_id: restaurant.id,
          franchisee_id: restaurant.franchisee_id,
          restaurant_name: restaurant.base_restaurant?.restaurant_name || 'Sin nombre',
          site_number: restaurant.base_restaurant?.site_number || 'N/A'
        })) || [];

        console.log('✅ useUserRestaurants: Successfully fetched admin restaurants:', formattedData);
        return formattedData;
      }

      // For regular users, use the RPC function
      const { data, error } = await supabase
        .rpc('get_user_restaurants');

      if (error) {
        console.error('❌ useUserRestaurants: Error fetching user restaurants:', error);
        throw error;
      }

      console.log('✅ useUserRestaurants: Successfully fetched user restaurants:', data);

      return data as Array<{
        restaurant_id: string;
        franchisee_id: string;
        restaurant_name: string;
        site_number: string;
      }>;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para estadísticas rápidas
export const useUnifiedRestaurantsStats = (filters: UnifiedRestaurantsFilters = {}) => {
  const { data: restaurants, isLoading } = useUnifiedRestaurants(filters);

  const stats = {
    total: restaurants?.length || 0,
    active: restaurants?.filter(r => r.status === 'active').length || 0,
    inactive: restaurants?.filter(r => r.status === 'inactive').length || 0,
    pending: restaurants?.filter(r => r.status === 'pending').length || 0,
    totalRevenue: restaurants?.reduce((sum, r) => sum + (r.last_year_revenue || 0), 0) || 0,
    avgRevenue: restaurants?.length ? 
      (restaurants.reduce((sum, r) => sum + (r.last_year_revenue || 0), 0) / restaurants.length) : 0,
  };

  return {
    stats,
    isLoading,
  };
};
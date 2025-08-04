// === HOOK ESPECIALIZADO PARA DATOS DE RESTAURANTES ESPECÍFICOS ===
// Reemplaza y mejora useRestaurantData original con mejor tipado y manejo de errores

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { logger } from '@/services/base/LoggerService';

export interface RestaurantData {
  id: string;
  status: string;
  base_restaurant: {
    id: string;
    restaurant_name: string;
    site_number: string;
    address: string;
    city: string;
    state: string;
    country: string;
    restaurant_type: string;
    opening_date: string;
    seating_capacity: number;
    square_meters: number;
    property_type: string;
  };
  franchise_start_date: string;
  franchise_end_date: string;
  monthly_rent: number;
  last_year_revenue: number;
  franchise_fee_percentage: number;
  advertising_fee_percentage: number;
  notes: string;
}

export const restaurantDataKeys = {
  all: ['restaurant-data'] as const,
  detail: (restaurantId: string, franchiseeId?: string) => 
    [...restaurantDataKeys.all, 'detail', restaurantId, franchiseeId] as const,
};

export function useRestaurantData(restaurantId: string) {
  const { effectiveFranchisee, user } = useAuth();

  return useQuery({
    queryKey: restaurantDataKeys.detail(restaurantId, effectiveFranchisee?.id),
    queryFn: async (): Promise<RestaurantData> => {
      if (!restaurantId) {
        throw new Error('Restaurant ID is required');
      }

      // Obtener el rol del usuario
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      const userRole = profileData?.role;
      const isSuperAdmin = userRole === 'superadmin' || userRole === 'admin';

      logger.info('Fetching restaurant data', {
        component: 'useRestaurantData',
        restaurantId,
        userRole,
        isSuperAdmin,
        franchiseeId: effectiveFranchisee?.id
      });

      // Query base para obtener datos del restaurante
      let query = supabase
        .from('franchisee_restaurants')
        .select(`
          id,
          status,
          franchise_start_date,
          franchise_end_date,
          monthly_rent,
          last_year_revenue,
          franchise_fee_percentage,
          advertising_fee_percentage,
          notes,
          base_restaurant:base_restaurants(
            id,
            restaurant_name,
            site_number,
            address,
            city,
            state,
            country,
            restaurant_type,
            opening_date,
            seating_capacity,
            square_meters,
            property_type
          )
        `);

      // Para superadmins: intentar buscar por base_restaurant_id primero, luego por id
      if (isSuperAdmin) {
        // Primero intentar como base_restaurant_id
        const { data: dataByBaseId, error: errorByBaseId } = await query
          .eq('base_restaurant_id', restaurantId)
          .maybeSingle();
        
        if (!errorByBaseId && dataByBaseId) {
          logger.info('Successfully fetched restaurant data by base_restaurant_id', {
            component: 'useRestaurantData',
            restaurantId: dataByBaseId.id,
            baseRestaurantId: restaurantId,
            restaurantName: dataByBaseId.base_restaurant?.restaurant_name,
            userRole,
            isSuperAdmin
          });
          return dataByBaseId as RestaurantData;
        }
        
        // Si no se encuentra por base_restaurant_id, intentar por id
        const { data: dataById, error: errorById } = await query
          .eq('id', restaurantId)
          .maybeSingle();
          
        if (!errorById && dataById) {
          logger.info('Successfully fetched restaurant data by id', {
            component: 'useRestaurantData',
            restaurantId: dataById.id,
            restaurantName: dataById.base_restaurant?.restaurant_name,
            userRole,
            isSuperAdmin
          });
          return dataById as RestaurantData;
        }
        
        // Si ninguna funciona, buscar directamente en base_restaurants
        const { data: baseRestaurantData, error: baseRestaurantError } = await supabase
          .from('base_restaurants')
          .select('*')
          .eq('id', restaurantId)
          .maybeSingle();
        
        if (!baseRestaurantError && baseRestaurantData) {
          // Crear un objeto compatible para superadmins
          const syntheticData = {
            id: baseRestaurantData.id,
            status: 'active',
            franchise_start_date: null,
            franchise_end_date: null,
            monthly_rent: 0,
            last_year_revenue: 0,
            franchise_fee_percentage: 4.0,
            advertising_fee_percentage: 4.0,
            notes: '',
            base_restaurant: baseRestaurantData
          };
          
          logger.info('Successfully fetched base restaurant data for superadmin', {
            component: 'useRestaurantData',
            restaurantId: baseRestaurantData.id,
            restaurantName: baseRestaurantData.restaurant_name,
            userRole,
            isSuperAdmin
          });
          
          return syntheticData as RestaurantData;
        }
        
        // Si llegamos aquí, el restaurante no existe
        const errorMsg = `Restaurant ${restaurantId} not found in the system.`;
        logger.warn('Restaurant not found (superadmin)', {
          restaurantId,
          userRole,
          isSuperAdmin,
          component: 'useRestaurantData'
        });
        throw new Error(errorMsg);
      } else {
        // Para franquiciados: solo sus restaurantes asignados
        if (!effectiveFranchisee?.id) {
          throw new Error('Franchisee ID is required for non-admin users');
        }
        
        query = query.eq('franchisee_id', effectiveFranchisee.id).eq('id', restaurantId);
        const { data, error } = await query.maybeSingle();
        
        if (error) {
          logger.error('Error fetching restaurant data', {
            error: error.message,
            restaurantId,
            userRole,
            franchiseeId: effectiveFranchisee?.id,
            component: 'useRestaurantData'
          });
          throw new Error(`Error fetching restaurant data: ${error.message}`);
        }
        
        if (!data) {
          const errorMsg = `Restaurant ${restaurantId} not found for current franchisee. Access denied or restaurant doesn't exist.`;
          logger.warn('Restaurant not found (franchisee)', {
            restaurantId,
            userRole,
            isSuperAdmin,
            franchiseeId: effectiveFranchisee?.id,
            component: 'useRestaurantData'
          });
          throw new Error(errorMsg);
        }
        
        logger.info('Successfully fetched restaurant data for franchisee', {
          component: 'useRestaurantData',
          restaurantId: data.id,
          restaurantName: data.base_restaurant?.restaurant_name,
          userRole,
          franchiseeId: effectiveFranchisee?.id
        });
        
        return data as RestaurantData;
      }

    },
    enabled: !!restaurantId && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // No retry for access denied errors
      if (error.message.includes('not found') || error.message.includes('Access denied')) {
        return false;
      }
      return failureCount < 2;
    }
  });
}

export function useRestaurantDataLegacy(restaurantId: string) {
  const query = useRestaurantData(restaurantId);
  
  return {
    restaurant: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch
  };
}
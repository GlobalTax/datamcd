import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedRestaurant } from './useUnifiedRestaurants';

// Mantener compatibilidad con el tipo original
interface RestaurantData {
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

// Hook consolidado para obtener todos los datos de un restaurante usando el nuevo modelo
export const useRestaurantData = (restaurantId: string | undefined) => {
  // Usar la vista unificada como fuente principal
  const restaurantQuery = useUnifiedRestaurant(restaurantId);

  // Empleados del restaurante
  const employeesQuery = useQuery({
    queryKey: ['restaurant-employees', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'active');

      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });

  // Incidencias del restaurante
  const incidentsQuery = useQuery({
    queryKey: ['restaurant-incidents', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });

  // Presupuestos del restaurante
  const budgetsQuery = useQuery({
    queryKey: ['restaurant-budgets', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from('annual_budgets')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('year', currentYear);

      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });

  // Transformar datos para compatibilidad con el formato original
  const transformToLegacyFormat = (unifiedRestaurant: any): RestaurantData | null => {
    if (!unifiedRestaurant) return null;

    return {
      id: unifiedRestaurant.id,
      status: unifiedRestaurant.status,
      franchise_start_date: unifiedRestaurant.franchise_start_date,
      franchise_end_date: unifiedRestaurant.franchise_end_date,
      monthly_rent: unifiedRestaurant.monthly_rent,
      last_year_revenue: unifiedRestaurant.last_year_revenue,
      franchise_fee_percentage: unifiedRestaurant.franchise_fee_percentage,
      advertising_fee_percentage: unifiedRestaurant.advertising_fee_percentage,
      notes: unifiedRestaurant.notes,
      base_restaurant: {
        id: unifiedRestaurant.base_restaurant_id,
        restaurant_name: unifiedRestaurant.restaurant_name,
        site_number: unifiedRestaurant.site_number,
        address: unifiedRestaurant.address,
        city: unifiedRestaurant.city,
        state: unifiedRestaurant.state || '',
        country: unifiedRestaurant.country,
        restaurant_type: unifiedRestaurant.restaurant_type,
        opening_date: unifiedRestaurant.opening_date || '',
        seating_capacity: unifiedRestaurant.seating_capacity || 0,
        square_meters: unifiedRestaurant.square_meters || 0,
        property_type: unifiedRestaurant.property_type || '',
      }
    };
  };

  return {
    // Mantener interfaz original para compatibilidad
    restaurant: transformToLegacyFormat(restaurantQuery.data),
    loading: restaurantQuery.isLoading,
    error: restaurantQuery.error?.message || null,
    refetch: restaurantQuery.refetch,

    // Nuevos datos del modelo unificado
    unifiedRestaurant: restaurantQuery.data,
    employees: employeesQuery.data || [],
    incidents: incidentsQuery.data || [],
    budgets: budgetsQuery.data || [],

    // Estados adicionales
    isLoadingEmployees: employeesQuery.isLoading,
    isLoadingIncidents: incidentsQuery.isLoading,
    isLoadingBudgets: budgetsQuery.isLoading,

    // Función para refrescar todos los datos
    refetchAll: () => {
      restaurantQuery.refetch();
      employeesQuery.refetch();
      incidentsQuery.refetch();
      budgetsQuery.refetch();
    },
  };
};
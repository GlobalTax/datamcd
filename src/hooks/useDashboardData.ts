
import { useMemo } from 'react';
import { useAuth } from '@/hooks/AuthProvider';
import { CurrentValuation, RestaurantQueryData } from '@/types/valuationData';

interface DisplayRestaurant {
  id: string;
  name?: string;
  restaurant_name?: string;
  location?: string;
  city?: string;
  address?: string;
  siteNumber?: string;
  site_number?: string;
  franchiseeName?: string;
  opening_date?: string;
  contractEndDate?: string;
  restaurant_type?: string;
  status?: string;
  lastYearRevenue?: number;
  baseRent?: number;
  isOwnedByMcD?: boolean;
  currentValuation?: CurrentValuation;
}

type ConnectionStatus = 'connecting' | 'connected' | 'fallback';

export const useDashboardData = () => {
  const { user, franchisee, restaurants, loading } = useAuth();

  // Determinar el estado de conexión basado en los datos
  const connectionStatus: ConnectionStatus = useMemo(() => {
    if (loading) return 'connecting';
    if (user && user.id !== 'fallback-user') return 'connected';
    return 'fallback';
  }, [loading, user]);

  const isUsingCache = connectionStatus === 'fallback';

  // Transformar datos para el componente - usando tipos específicos
  const displayRestaurants: DisplayRestaurant[] = useMemo(() => {
    return (restaurants || []).map(r => {
      const restaurantData = r as RestaurantQueryData;
      
      // Los datos de useAuth pueden tener diferentes estructuras dependiendo de si vienen de Supabase o son fallback
      if (restaurantData.base_restaurant) {
        // Estructura de Supabase con relación base_restaurant
        return {
          id: restaurantData.id || `restaurant-${Math.random()}`,
          name: restaurantData.base_restaurant?.restaurant_name || 'Restaurante',
          restaurant_name: restaurantData.base_restaurant?.restaurant_name || 'Restaurante',
          location: restaurantData.base_restaurant ? 
            `${restaurantData.base_restaurant.city || 'Ciudad'}, ${restaurantData.base_restaurant.address || 'Dirección'}` : 
            'Ubicación',
          city: restaurantData.base_restaurant?.city || 'Ciudad',
          address: restaurantData.base_restaurant?.address || 'Dirección',
          siteNumber: restaurantData.base_restaurant?.site_number || 'N/A',
          site_number: restaurantData.base_restaurant?.site_number || 'N/A',
          franchiseeName: franchisee?.franchisee_name || 'Franquiciado',
          restaurant_type: restaurantData.base_restaurant?.restaurant_type || 'traditional',
          status: restaurantData.status || 'active',
          lastYearRevenue: typeof restaurantData.last_year_revenue === 'number' ? restaurantData.last_year_revenue : 0,
          baseRent: typeof restaurantData.monthly_rent === 'number' ? restaurantData.monthly_rent : 0,
          isOwnedByMcD: false,
        };
      } else {
        // Estructura simple de Restaurant o datos de fallback - convertir a unknown primero
        const simpleRestaurant = (restaurantData as unknown) as Record<string, unknown>;
        return {
          id: (simpleRestaurant.id as string) || `restaurant-${Math.random()}`,
          name: (simpleRestaurant.restaurant_name as string) || (simpleRestaurant.name as string) || 'Restaurante',
          restaurant_name: (simpleRestaurant.restaurant_name as string) || (simpleRestaurant.name as string) || 'Restaurante',
          location: `${(simpleRestaurant.city as string) || 'Ciudad'}, ${(simpleRestaurant.address as string) || 'Dirección'}`,
          city: (simpleRestaurant.city as string) || 'Ciudad',
          address: (simpleRestaurant.address as string) || 'Dirección',
          siteNumber: (simpleRestaurant.site_number as string) || 'N/A',
          site_number: (simpleRestaurant.site_number as string) || 'N/A',
          franchiseeName: franchisee?.franchisee_name || 'Franquiciado',
          restaurant_type: (simpleRestaurant.restaurant_type as string) || 'traditional',
          status: (simpleRestaurant.status as string) || 'active',
          lastYearRevenue: typeof simpleRestaurant.lastYearRevenue === 'number' ? simpleRestaurant.lastYearRevenue : 0,
          baseRent: typeof simpleRestaurant.baseRent === 'number' ? simpleRestaurant.baseRent : 0,
          isOwnedByMcD: false,
        };
      }
    });
  }, [restaurants, franchisee]);

  // Calcular métricas del dashboard
  const metrics = useMemo(() => {
    const totalRevenue = displayRestaurants.reduce((sum, r) => sum + (r.lastYearRevenue || 0), 0);
    const totalRent = displayRestaurants.reduce((sum, r) => sum + (r.baseRent || 0) * 12, 0);
    const operatingMargin = totalRevenue > 0 ? ((totalRevenue - totalRent) / totalRevenue) * 100 : 0;
    const averageROI = totalRevenue > 0 && totalRent > 0 ? ((totalRevenue - totalRent) / totalRent) * 100 : 0;

    return {
      totalRevenue,
      operatingMargin,
      averageROI,
      totalRestaurants: displayRestaurants.length
    };
  }, [displayRestaurants]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return {
    user,
    franchisee,
    restaurants,
    loading,
    connectionStatus,
    isUsingCache,
    displayRestaurants,
    metrics,
    formatCurrency
  };
};

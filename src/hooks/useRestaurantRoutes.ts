import { useNavigate } from 'react-router-dom';
import { useRestaurantContext } from '@/providers/RestaurantContext';

export type RestaurantSection = 
  | 'hub' 
  | 'staff' 
  | 'payroll' 
  | 'budget' 
  | 'profit-loss' 
  | 'incidents' 
  | 'analytics' 
  | 'integrations';

/**
 * Hook para construir y navegar entre rutas basadas en restaurante
 */
export const useRestaurantRoutes = () => {
  const navigate = useNavigate();
  const { currentRestaurantId } = useRestaurantContext();

  /**
   * Construir URL para una sección específica de un restaurante
   */
  const buildRestaurantRoute = (restaurantId: string, section: RestaurantSection): string => {
    return `/restaurant/${restaurantId}/${section}`;
  };

  /**
   * Navegar a una sección del restaurante actual
   */
  const navigateToCurrentRestaurant = (section: RestaurantSection) => {
    if (!currentRestaurantId) {
      console.warn('No current restaurant selected for navigation');
      return;
    }
    const route = buildRestaurantRoute(currentRestaurantId, section);
    navigate(route);
  };

  /**
   * Navegar a una sección específica de cualquier restaurante
   */
  const navigateToRestaurant = (restaurantId: string, section: RestaurantSection) => {
    const route = buildRestaurantRoute(restaurantId, section);
    navigate(route);
  };

  /**
   * Obtener rutas para el restaurante actual
   */
  const getCurrentRestaurantRoutes = () => {
    if (!currentRestaurantId) return null;
    
    return {
      hub: buildRestaurantRoute(currentRestaurantId, 'hub'),
      staff: buildRestaurantRoute(currentRestaurantId, 'staff'),
      payroll: buildRestaurantRoute(currentRestaurantId, 'payroll'),
      budget: buildRestaurantRoute(currentRestaurantId, 'budget'),
      profitLoss: buildRestaurantRoute(currentRestaurantId, 'profit-loss'),
      incidents: buildRestaurantRoute(currentRestaurantId, 'incidents'),
      analytics: buildRestaurantRoute(currentRestaurantId, 'analytics'),
      integrations: buildRestaurantRoute(currentRestaurantId, 'integrations'),
    };
  };

  return {
    buildRestaurantRoute,
    navigateToCurrentRestaurant,
    navigateToRestaurant,
    getCurrentRestaurantRoutes,
    currentRestaurantId,
  };
};
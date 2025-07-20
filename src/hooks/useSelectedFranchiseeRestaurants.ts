
import { useMemo } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useUnifiedRestaurants } from '@/hooks/useUnifiedRestaurants';
import { useFranchiseeContext } from '@/contexts/FranchiseeContext';

export const useSelectedFranchiseeRestaurants = () => {
  const { user, restaurants: authRestaurants } = useUnifiedAuth();
  const { restaurants: unifiedRestaurants, loading } = useUnifiedRestaurants();
  const { selectedFranchisee } = useFranchiseeContext();

  const filteredRestaurants = useMemo(() => {
    const activeRestaurants = authRestaurants.length > 0 ? authRestaurants : unifiedRestaurants;
    
    // Si no hay franquiciado seleccionado, devolver todos
    if (!selectedFranchisee) return activeRestaurants;
    
    // Si es un admin con franquiciado seleccionado, filtrar por ese franquiciado
    if (selectedFranchisee && ['admin', 'superadmin'].includes(user?.role)) {
      return activeRestaurants.filter(restaurant => {
        // Type guard para UnifiedRestaurant
        if ('franchisee_info' in restaurant && restaurant.franchisee_info) {
          return restaurant.franchisee_info.id === selectedFranchisee.id;
        }
        // Type guard para Restaurant  
        if ('franchisee_id' in restaurant) {
          return restaurant.franchisee_id === selectedFranchisee.id;
        }
        return false;
      });
    }
    
    return activeRestaurants;
  }, [authRestaurants, unifiedRestaurants, selectedFranchisee, user?.role]);

  return {
    restaurants: filteredRestaurants,
    loading,
    selectedFranchisee
  };
};

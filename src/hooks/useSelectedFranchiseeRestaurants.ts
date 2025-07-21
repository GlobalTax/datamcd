
import { useMemo } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useUnifiedRestaurants } from '@/hooks/useUnifiedRestaurants';
import { useFranchiseeSpecificRestaurants } from '@/hooks/useFranchiseeSpecificRestaurants';
import { useFranchiseeContext } from '@/contexts/FranchiseeContext';

export const useSelectedFranchiseeRestaurants = () => {
  const { user, restaurants: authRestaurants } = useUnifiedAuth();
  const { selectedFranchisee } = useFranchiseeContext();
  
  // Usar el hook específico cuando hay un franquiciado seleccionado
  const { 
    restaurants: specificRestaurants, 
    loading: specificLoading 
  } = useFranchiseeSpecificRestaurants(selectedFranchisee?.id);
  
  // Hook unificado como fallback
  const { 
    restaurants: unifiedRestaurants, 
    loading: unifiedLoading 
  } = useUnifiedRestaurants(selectedFranchisee?.id);

  const filteredRestaurants = useMemo(() => {
    console.log('useSelectedFranchiseeRestaurants - Computing filtered restaurants');
    console.log('selectedFranchisee:', selectedFranchisee?.franchisee_name);
    console.log('specificRestaurants count:', specificRestaurants.length);
    console.log('unifiedRestaurants count:', unifiedRestaurants.length);
    console.log('authRestaurants count:', authRestaurants.length);
    
    // Si hay franquiciado seleccionado, usar restaurantes específicos
    if (selectedFranchisee) {
      if (user?.role && ['admin', 'superadmin'].includes(user.role)) {
        // Para admins, usar los restaurantes específicos del franquiciado seleccionado
        const restaurants = specificRestaurants.length > 0 ? specificRestaurants : unifiedRestaurants;
        console.log('Admin view - returning restaurants for selected franchisee:', restaurants.length);
        return restaurants;
      }
    }
    
    // Para franquiciados normales o cuando no hay selección específica
    const activeRestaurants = authRestaurants.length > 0 ? authRestaurants : unifiedRestaurants;
    console.log('Default view - returning active restaurants:', activeRestaurants.length);
    return activeRestaurants;
  }, [authRestaurants, unifiedRestaurants, specificRestaurants, selectedFranchisee, user?.role]);

  const loading = specificLoading || unifiedLoading;

  console.log('useSelectedFranchiseeRestaurants - Final result:', {
    restaurantsCount: filteredRestaurants.length,
    loading,
    selectedFranchisee: selectedFranchisee?.franchisee_name
  });

  return {
    restaurants: filteredRestaurants,
    loading,
    selectedFranchisee
  };
};

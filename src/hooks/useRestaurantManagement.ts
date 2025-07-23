
import { useState, useEffect, useMemo } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuthCompat';
import { useAllRestaurants } from '@/hooks/useAllRestaurants';
import { useOptimizedFranchiseeRestaurants } from '@/hooks/useOptimizedFranchiseeRestaurants';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';
import { secureLogger } from '@/utils/secureLogger';

export const useRestaurantManagement = () => {
  const { user, franchisee } = useUnifiedAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Determinar si el usuario puede ver todos los restaurantes
  const canViewAllRestaurants = useMemo(() => {
    if (!user) return false;
    
    const canView = ['admin', 'superadmin', 'asesor'].includes(user.role || '');
    
    secureLogger.debug('useRestaurantManagement - Access level determined', {
      userRole: user.role,
      canViewAllRestaurants: canView,
      userId: user.id
    });
    
    return canView;
  }, [user?.role, user?.id]);

  // Determinar si el usuario necesita datos de franquiciado
  const needsFranchiseeData = useMemo(() => {
    if (!user) return false;
    
    const needsData = user.role === 'franchisee';
    
    secureLogger.debug('useRestaurantManagement - Franchisee data requirement', {
      userRole: user.role,
      needsData,
      userId: user.id
    });
    
    return needsData;
  }, [user?.role, user?.id]);
  
  // Hook para admin/superadmin/asesor - ve todos los restaurantes
  const adminData = useAllRestaurants();
  
  // Hook para franchisee - ve solo sus restaurantes
  const franchiseeData = useOptimizedFranchiseeRestaurants();
  
  // Seleccionar los datos apropiados según el rol
  const { restaurants, loading, error: dataError, refetch } = canViewAllRestaurants ? adminData : franchiseeData;

  // Manejar errores de los hooks de datos
  useEffect(() => {
    if (dataError) {
      secureLogger.error('useRestaurantManagement - Data error', dataError);
      setError(dataError);
    } else {
      setError(null);
    }
  }, [dataError]);

  // Logging detallado para debugging
  useEffect(() => {
    secureLogger.debug('useRestaurantManagement - Data summary', {
      userRole: user?.role,
      canViewAllRestaurants,
      needsFranchiseeData,
      restaurantCount: restaurants.length,
      loading,
      hasError: !!error,
      franchiseeId: franchisee?.id,
      franchiseeName: franchisee?.franchisee_name
    });
  }, [user?.role, canViewAllRestaurants, needsFranchiseeData, restaurants.length, loading, error, franchisee?.id, franchisee?.franchisee_name]);

  // Formatear restaurantes para mostrar información del franquiciado si es admin
  const formattedRestaurants = useMemo(() => {
    if (!canViewAllRestaurants) {
      return restaurants;
    }

    // Para admin/superadmin, añadir información del franquiciado
    return restaurants.map(restaurant => ({
      ...restaurant,
      franchisee_display_name: (restaurant as any).franchisees?.franchisee_name || 
                              restaurant.base_restaurant?.franchisee_name || 
                              'Sin asignar'
    }));
  }, [restaurants, canViewAllRestaurants]);

  // Verificar que el usuario tenga los permisos necesarios
  const hasValidAccess = useMemo(() => {
    if (!user) return false;
    
    // Admin, superadmin y asesor siempre tienen acceso
    if (canViewAllRestaurants) {
      secureLogger.debug('useRestaurantManagement - Admin access granted', {
        userRole: user.role,
        userId: user.id
      });
      return true;
    }
    
    // Franchisee necesita tener datos de franquiciado
    if (user.role === 'franchisee') {
      const hasAccess = !!franchisee;
      secureLogger.debug('useRestaurantManagement - Franchisee access check', {
        userRole: user.role,
        userId: user.id,
        hasFranchiseeData: !!franchisee,
        hasAccess
      });
      return hasAccess;
    }
    
    return false;
  }, [user, canViewAllRestaurants, franchisee]);

  return {
    restaurants: formattedRestaurants,
    loading,
    error,
    refetch,
    canViewAllRestaurants,
    hasValidAccess,
    needsFranchiseeData,
    user,
    franchisee
  };
};

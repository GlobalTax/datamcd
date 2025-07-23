
import { useState, useEffect, useMemo } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuthCompat';
import { useAllRestaurants } from '@/hooks/useAllRestaurants';
import { useOptimizedFranchiseeRestaurants } from '@/hooks/useOptimizedFranchiseeRestaurants';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

export const useRestaurantManagement = () => {
  const { user, franchisee } = useUnifiedAuth();
  
  // Determinar si el usuario puede ver todos los restaurantes
  const canViewAllRestaurants = user?.role === 'admin' || user?.role === 'superadmin';
  
  // Hook para admin/superadmin - ve todos los restaurantes
  const adminData = useAllRestaurants();
  
  // Hook para franchisee - ve solo sus restaurantes
  const franchiseeData = useOptimizedFranchiseeRestaurants();
  
  // Seleccionar los datos apropiados según el rol
  const { restaurants, loading, error, refetch } = canViewAllRestaurants ? adminData : franchiseeData;

  console.log('useRestaurantManagement - User role:', user?.role);
  console.log('useRestaurantManagement - Can view all restaurants:', canViewAllRestaurants);
  console.log('useRestaurantManagement - Restaurants count:', restaurants.length);

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

  return {
    restaurants: formattedRestaurants,
    loading,
    error,
    refetch,
    canViewAllRestaurants,
    user,
    franchisee
  };
};

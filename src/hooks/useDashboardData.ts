
import { useState, useEffect, useMemo } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuthCompat';
import { useUnifiedRestaurants } from '@/hooks/useUnifiedRestaurants';
import { useFranchiseeContext } from '@/contexts/FranchiseeContext';

export interface DashboardMetrics {
  totalRestaurants: number;
  totalRevenue: number;
  averageRevenue: number;
  operatingMargin: number;
  averageROI: number;
  alerts: number;
  tasks: number;
  revenueGrowth: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  restaurants: any[];
  franchisee: any;
  user: any;
  loading: boolean;
  error: string | null;
  connectionStatus: 'online' | 'offline' | 'reconnecting';
  isImpersonating: boolean;
  effectiveFranchisee: any;
}

export const useDashboardData = (): DashboardData => {
  const { 
    user, 
    franchisee, 
    restaurants, 
    loading: authLoading, 
    connectionStatus,
    isImpersonating,
    effectiveFranchisee 
  } = useUnifiedAuth();
  
  const { 
    restaurants: unifiedRestaurants, 
    loading: restaurantsLoading 
  } = useUnifiedRestaurants();

  const { selectedFranchisee } = useFranchiseeContext();

  const [error, setError] = useState<string | null>(null);

  const loading = authLoading || restaurantsLoading;

  // Usar el franquiciado seleccionado del contexto cuando esté disponible
  const currentFranchisee = selectedFranchisee || effectiveFranchisee || franchisee;

  // Filtrar restaurantes según el franquiciado seleccionado
  const filteredRestaurants = useMemo(() => {
    const activeRestaurants = restaurants.length > 0 ? restaurants : unifiedRestaurants;
    
    if (!currentFranchisee) return activeRestaurants;
    
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
  }, [restaurants, unifiedRestaurants, currentFranchisee, selectedFranchisee, user?.role]);

  // Calcular métricas principales con los restaurantes filtrados
  const metrics = useMemo((): DashboardMetrics => {
    const totalRevenue = filteredRestaurants.reduce((sum, r) => {
      // Manejar tanto Restaurant como UnifiedRestaurant con verificaciones de propiedades
      let revenue = 0;
      if ('assignment' in r && r.assignment?.last_year_revenue) {
        revenue = r.assignment.last_year_revenue;
      } else if ('last_year_revenue' in r && r.last_year_revenue) {
        revenue = r.last_year_revenue as number;
      }
      return sum + revenue;
    }, 0);
    
    const totalRent = filteredRestaurants.reduce((sum, r) => {
      // Manejar tanto Restaurant como UnifiedRestaurant con verificaciones de propiedades
      let rent = 0;
      if ('assignment' in r && r.assignment?.monthly_rent) {
        rent = r.assignment.monthly_rent;
      } else if ('monthly_rent' in r && r.monthly_rent) {
        rent = r.monthly_rent as number;
      }
      return sum + (rent * 12);
    }, 0);

    const operatingIncome = totalRevenue - totalRent;
    const operatingMargin = totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0;
    const averageROI = totalRent > 0 ? (operatingIncome / totalRent) * 100 : 0;
    const averageRevenue = filteredRestaurants.length > 0 ? totalRevenue / filteredRestaurants.length : 0;

    return {
      totalRestaurants: filteredRestaurants.length,
      totalRevenue,
      averageRevenue,
      operatingMargin,
      averageROI,
      alerts: 3, // Mock data - sería calculado desde alertas reales
      tasks: 5, // Mock data - sería calculado desde tareas reales
      revenueGrowth: 8.2 // Mock data - sería calculado con datos históricos
    };
  }, [filteredRestaurants]);

  const dashboardData: DashboardData = {
    metrics,
    restaurants: filteredRestaurants,
    franchisee: currentFranchisee,
    user,
    loading,
    error,
    connectionStatus,
    isImpersonating,
    effectiveFranchisee: currentFranchisee
  };

  return dashboardData;
};

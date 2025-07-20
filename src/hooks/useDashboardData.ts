
import { useState, useEffect, useMemo } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useUnifiedRestaurants } from '@/hooks/useUnifiedRestaurants';

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

  const [error, setError] = useState<string | null>(null);

  const loading = authLoading || restaurantsLoading;

  // Calcular métricas principales
  const metrics = useMemo((): DashboardMetrics => {
    const activeRestaurants = restaurants.length > 0 ? restaurants : unifiedRestaurants;
    
    const totalRevenue = activeRestaurants.reduce((sum, r) => {
      // Manejar tanto Restaurant como UnifiedRestaurant con verificaciones de propiedades
      let revenue = 0;
      if ('assignment' in r && r.assignment?.last_year_revenue) {
        revenue = r.assignment.last_year_revenue;
      } else if ('last_year_revenue' in r && r.last_year_revenue) {
        revenue = r.last_year_revenue;
      }
      return sum + revenue;
    }, 0);
    
    const totalRent = activeRestaurants.reduce((sum, r) => {
      // Manejar tanto Restaurant como UnifiedRestaurant con verificaciones de propiedades
      let rent = 0;
      if ('assignment' in r && r.assignment?.monthly_rent) {
        rent = r.assignment.monthly_rent;
      } else if ('monthly_rent' in r && r.monthly_rent) {
        rent = r.monthly_rent;
      }
      return sum + (rent * 12);
    }, 0);

    const operatingIncome = totalRevenue - totalRent;
    const operatingMargin = totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0;
    const averageROI = totalRent > 0 ? (operatingIncome / totalRent) * 100 : 0;
    const averageRevenue = activeRestaurants.length > 0 ? totalRevenue / activeRestaurants.length : 0;

    return {
      totalRestaurants: activeRestaurants.length,
      totalRevenue,
      averageRevenue,
      operatingMargin,
      averageROI,
      alerts: 3, // Mock data - sería calculado desde alertas reales
      tasks: 5, // Mock data - sería calculado desde tareas reales
      revenueGrowth: 8.2 // Mock data - sería calculado con datos históricos
    };
  }, [restaurants, unifiedRestaurants]);

  const dashboardData: DashboardData = {
    metrics,
    restaurants: restaurants.length > 0 ? restaurants : unifiedRestaurants,
    franchisee: effectiveFranchisee || franchisee,
    user,
    loading,
    error,
    connectionStatus,
    isImpersonating,
    effectiveFranchisee
  };

  return dashboardData;
};

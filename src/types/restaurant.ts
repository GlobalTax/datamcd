// Re-exports de tipos centralizados para compatibilidad
export type {
  Restaurant,
  BaseRestaurant,
  Franchisee,
  FranchiseeRestaurant
} from './core';

// Tipos específicos de este dominio
export interface RestaurantFilters {
  status?: string;
  type?: string;
  franchisee?: string;
}

export interface RestaurantMetrics {
  totalRevenue: number;
  avgMonthlyRevenue: number;
  profitMargin: number;
  lastUpdated: string;
}

export interface RestaurantValuation {
  id: string;
  restaurantId: string;
  valuationDate: string;
  initialSales: number;
  currentValuation: number;
  projectedYears: number;
}
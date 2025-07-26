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

export interface ValuationFormData {
  valuationDate: string;
  initialSales: number;
  salesGrowthRate: number;
  inflationRate: number;
  discountRate: number;
  yearsRemaining: number;
  pacPercentage: number;
  rentPercentage: number;
  serviceFeesPercentage: number;
  depreciation: number;
  interest: number;
  loanPayment: number;
  rentIndex: number;
  miscellaneous: number;
}
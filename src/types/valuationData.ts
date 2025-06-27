
export interface ValuationData {
  inputs: {
    sales: number;
    pac: number;
    rent: number;
    serviceFees: number;
    depreciation: number;
    interest: number;
    rentIndex: number;
    miscell: number;
    loanPayment: number;
    inflationRate: number;
    discountRate: number;
    growthRate: number;
    changeDate: string;
    franchiseEndDate: string;
    remainingYears: number;
  };
  yearlyData: Array<{
    sales: number;
    pac: number;
    pacPercentage: number;
    rent: number;
    rentPercentage: number;
    serviceFees: number;
    depreciation: number;
    interest: number;
    rentIndex: number;
    miscell: number;
    loanPayment: number;
    reinversion: number;
  }>;
  projections: Array<{
    year: number;
    cfValue: number;
    presentValue: number;
    timeToNextYear: number;
    yearData: any;
  }>;
  totalPrice: number;
}

export interface CurrentValuation {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  valuation_name: string;
  valuation_date: string;
  change_date?: string;
  franchise_end_date?: string;
  remaining_years?: number;
  inflation_rate: number;
  discount_rate: number;
  growth_rate: number;
  yearly_data: any[];
  total_present_value?: number;
  projections?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface RestaurantQueryData {
  id: string;
  monthly_rent?: number;
  last_year_revenue?: number;
  status?: string;
  base_restaurant?: {
    id: string;
    site_number: string;
    restaurant_name: string;
    address: string;
    city: string;
    restaurant_type: string;
  } | null;
}

export interface ExportDataRow {
  [key: string]: string | number | boolean | null | undefined;
}

export type ExportDataArray = ExportDataRow[];

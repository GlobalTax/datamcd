
export interface BaseRestaurant {
  id: string;
  site_number: string;
  restaurant_name: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  restaurant_type: string;
  property_type?: string;
  autonomous_community?: string;
  franchisee_name?: string;
  franchisee_email?: string;
  company_tax_id?: string;
  square_meters?: number;
  seating_capacity?: number;
  opening_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface FranchiseeRestaurant {
  id: string;
  franchisee_id: string;
  base_restaurant_id?: string;
  franchise_start_date?: string;
  franchise_end_date?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  monthly_rent?: number;
  franchise_fee_percentage?: number;
  advertising_fee_percentage?: number;
  last_year_revenue?: number;
  average_monthly_sales?: number;
  status?: string;
  notes?: string;
  assigned_at: string;
  updated_at: string;
  base_restaurant?: BaseRestaurant;
}

export interface RestaurantBudget {
  id: string;
  franchisee_restaurant_id: string;
  year: number;
  budgeted_revenue: number;
  budgeted_food_cost?: number;
  budgeted_labor_cost?: number;
  budgeted_rent?: number;
  budgeted_utilities?: number;
  budgeted_marketing?: number;
  budgeted_other_expenses?: number;
  monthly_revenue_target?: number;
  monthly_profit_target?: number;
  created_at: string;
  updated_at: string;
}

export interface MonthlyTracking {
  id: string;
  franchisee_restaurant_id: string;
  year: number;
  month: number;
  actual_revenue?: number;
  actual_food_cost?: number;
  actual_labor_cost?: number;
  actual_rent?: number;
  actual_utilities?: number;
  actual_marketing?: number;
  actual_other_expenses?: number;
  customer_count?: number;
  average_ticket?: number;
  labor_hours?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

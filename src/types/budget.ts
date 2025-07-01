
export interface ValuationBudget {
  id: string;
  franchisee_restaurant_id: string;
  budget_name: string;
  budget_year: number;
  initial_sales: number;
  status: string;
  notes?: string | null;
  discount_rate: number;
  years_projection: number;
  sales_growth_rate: number | null;
  inflation_rate: number | null;
  pac_percentage: number | null;
  rent_percentage: number | null;
  service_fees_percentage: number | null;
  depreciation: number | null;
  interest: number | null;
  loan_payment: number | null;
  rent_index: number | null;
  miscellaneous: number | null;
  final_valuation: number | null;
  projected_cash_flows: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetData {
  id: string;
  category: string;
  subcategory?: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  total: number;
}

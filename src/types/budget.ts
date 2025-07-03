
export interface ValuationBudget {
  id: string;
  franchisee_restaurant_id: string;
  budget_name: string;
  budget_year: number;
  
  // Parámetros de valoración
  initial_sales: number;
  sales_growth_rate: number;
  inflation_rate: number;
  discount_rate: number;
  years_projection: number;
  
  // Costos como porcentaje de ventas
  pac_percentage: number;
  rent_percentage: number;
  service_fees_percentage: number;
  
  // Costos fijos anuales
  depreciation: number;
  interest: number;
  loan_payment: number;
  rent_index: number;
  miscellaneous: number;
  
  // Resultados calculados - usar any para manejar el tipo Json de Supabase
  final_valuation?: number;
  projected_cash_flows?: any; // Cambio de number[] a any para compatibilidad
  
  // Metadatos
  status: 'draft' | 'approved' | 'archived';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ValuationBudgetFormData {
  budget_name: string;
  budget_year: number;
  franchisee_restaurant_id: string;
  
  // Parámetros básicos
  initial_sales: number;
  sales_growth_rate: number;
  inflation_rate: number;
  discount_rate: number;
  years_projection: number;
  
  // Costos como porcentajes
  pac_percentage: number;
  rent_percentage: number;
  service_fees_percentage: number;
  
  // Costos fijos
  depreciation: number;
  interest: number;
  loan_payment: number;
  rent_index: number;
  miscellaneous: number;
  
  notes?: string;
}

// Extender el tipo para incluir campos calculados
export interface ValuationBudgetUpdateData extends Partial<ValuationBudgetFormData> {
  final_valuation?: number;
  projected_cash_flows?: number[];
}

export interface ProjectedYear {
  year: number;
  sales: number;
  pac: number;
  rent: number;
  service_fees: number;
  total_costs: number;
  net_income: number;
  cash_flow: number;
  present_value: number;
}

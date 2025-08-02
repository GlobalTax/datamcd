// === DOMINIO: FINANZAS ===
// Tipos relacionados con P&L, valuaciones y análisis financiero

// P&L Types
export interface ProfitLossFormData {
  id?: string;
  restaurant_id: string;
  year: number;
  month: number;
  // Ingresos
  net_sales: number;
  other_revenue: number;
  
  // Costos de Comida
  food_cost: number;
  food_employees: number;
  waste: number;
  paper_cost: number;
  
  // Mano de Obra
  crew_labor: number;
  management_labor: number;
  social_security: number;
  travel_expenses: number;
  
  // Gastos Controlables
  advertising: number;
  promotion: number;
  external_services: number;
  uniforms: number;
  operation_supplies: number;
  maintenance: number;
  utilities: number;
  office_expenses: number;
  cash_differences: number;
  other_controllable: number;
  
  // Gastos No Controlables
  pac: number;
  rent: number;
  additional_rent: number;
  royalty: number;
  office_legal: number;
  insurance: number;
  taxes_licenses: number;
  depreciation: number;
  interest: number;
  other_non_controllable: number;
  
  // Otros
  non_product_sales: number;
  non_product_cost: number;
  draw_salary: number;
  general_expenses: number;
  loan_payment: number;
  investment_own_funds: number;
  
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// Datos históricos detallados
export interface DetailedYearlyData {
  year: number;
  // Ingresos
  ventas_netas: number;
  valor_produccion: number;
  
  // Costos de Comida detallados
  comida: number;
  comida_empleados: number;
  desperdicios: number;
  papel: number;
  
  // Mano de Obra detallada
  mano_obra: number;
  mano_obra_gerencia: number;
  seguridad_social: number;
  gastos_viajes: number;
  
  // Gastos Controlables detallados
  publicidad: number;
  promocion: number;
  servicios_exteriores: number;
  uniformes: number;
  suministros_operacion: number;
  reparacion_mantenimiento: number;
  luz_agua_telefono: number;
  gastos_oficina: number;
  diferencias_caja: number;
  varios_controlables: number;
  
  // Gastos No Controlables detallados
  pac: number;
  renta: number;
  renta_adicional: number;
  royalty: number;
  oficina_legal: number;
  seguros: number;
  tasas_licencias: number;
  depreciaciones_amortizaciones: number;
  intereses: number;
  perdidas_venta_equipos: number;
  varios_no_controlables: number;
  
  // Otros
  ventas_no_producto: number;
  costo_no_producto: number;
  draw_salary: number;
  gastos_generales: number;
  cuota_prestamo: number;
  inversiones_fondos_propios: number;
}

export interface YearlyData {
  year: number;
  net_sales: number;
  other_revenue: number;
  food_cost: number;
  food_employees: number;
  waste: number;
  paper_cost: number;
  crew_labor: number;
  management_labor: number;
  social_security: number;
  travel_expenses: number;
  advertising: number;
  promotion: number;
  external_services: number;
  uniforms: number;
  operation_supplies: number;
  maintenance: number;
  utilities: number;
  office_expenses: number;
  cash_differences: number;
  other_controllable: number;
  pac: number;
  rent: number;
  additional_rent: number;
  royalty: number;
  office_legal: number;
  insurance: number;
  taxes_licenses: number;
  depreciation: number;
  interest: number;
  other_non_controllable: number;
  non_product_sales: number;
  non_product_cost: number;
  draw_salary: number;
  general_expenses: number;
  loan_payment: number;
  investment_own_funds: number;
}

// Tipos para importación de datos
export type ImportStep = 'upload' | 'review' | 'import';
export type ImportMethod = 'manual' | 'csv' | 'file' | 'detailed';

// Valuaciones
export interface ValuationInputs {
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
}

export interface YearlyValuationData {
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
}

export interface ProjectionData {
  year: number;
  cfValue: number;
  presentValue: number;
  timeToNextYear: number;
  yearData: YearlyValuationData;
}

export interface RestaurantValuation {
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
  yearly_data: YearlyValuationData[];
  total_present_value?: number;
  projections?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ValuationScenario {
  id: string;
  valuation_id: string;
  scenario_name: string;
  scenario_description?: string;
  inflation_rate_modifier: number;
  discount_rate_modifier: number;
  growth_rate_modifier: number;
  yearly_modifications: Record<string, any>;
  total_present_value?: number;
  projections?: any;
  variance_from_base?: number;
  variance_percentage?: number;
  created_at: string;
  updated_at: string;
}

// Métricas financieras
export interface FinancialMetrics {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  ebitda: number;
  foodCostPercentage: number;
  laborCostPercentage: number;
  controllableExpensesPercentage: number;
  nonControllableExpensesPercentage: number;
}

// Props para componentes
export interface ProfitLossFormProps {
  restaurantId: string;
  year: number;
  month: number;
  data?: ProfitLossFormData;
  onSave: (data: ProfitLossFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface HistoricalDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  onDataImported?: () => void;
}

export interface ValuationFormProps {
  restaurantId: string;
  onSave: (valuation: Partial<RestaurantValuation>) => Promise<void>;
  initialData?: Partial<RestaurantValuation>;
}

export interface FinancialMetricsProps {
  restaurantId: string;
  year: number;
  month?: number;
}

export interface ProfitabilityAnalysisProps {
  restaurantId: string;
  period: {
    from: string;
    to: string;
  };
}
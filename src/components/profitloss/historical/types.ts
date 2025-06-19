
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

export type ImportStep = 'upload' | 'review' | 'import';
export type ImportMethod = 'manual' | 'csv' | 'file' | 'detailed';

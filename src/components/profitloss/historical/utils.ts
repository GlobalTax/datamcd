
import { showError } from '@/utils/notifications';

export interface YearlyData {
  year: number;
  net_sales: number;
  other_revenue: number;
  food_employees: number;
  waste: number;
  food_cost: number;
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

export interface MonthlyProfitLoss {
  month: number;
  net_sales: number;
  other_revenue: number;
  food_cost: number;
  paper_cost: number;
  management_labor: number;
  crew_labor: number;
  benefits: number;
  rent: number;
  utilities: number;
  maintenance: number;
  advertising: number;
  insurance: number;
  supplies: number;
  other_expenses: number;
  franchise_fee: number;
  advertising_fee: number;
  rent_percentage: number;
}

export const createEmptyYearlyData = (year: number): YearlyData => {
  return {
    year,
    net_sales: 0,
    other_revenue: 0,
    food_employees: 0,
    waste: 0,
    food_cost: 0,
    paper_cost: 0,
    crew_labor: 0,
    management_labor: 0,
    social_security: 0,
    travel_expenses: 0,
    advertising: 0,
    promotion: 0,
    external_services: 0,
    uniforms: 0,
    operation_supplies: 0,
    maintenance: 0,
    utilities: 0,
    office_expenses: 0,
    cash_differences: 0,
    other_controllable: 0,
    pac: 0,
    rent: 0,
    additional_rent: 0,
    royalty: 0,
    office_legal: 0,
    insurance: 0,
    taxes_licenses: 0,
    depreciation: 0,
    interest: 0,
    other_non_controllable: 0,
    non_product_sales: 0,
    non_product_cost: 0,
    draw_salary: 0,
    general_expenses: 0,
    loan_payment: 0,
    investment_own_funds: 0
  };
};

export const validateYearlyData = (data: YearlyData): boolean => {
  if (!data.year || data.year < 2000 || data.year > 2050) {
    showError('Año inválido');
    return false;
  }
  return true;
};

export const parseDataFromText = (text: string): YearlyData[] => {
  try {
    const lines = text.split('\n').filter(line => line.trim());
    const results: YearlyData[] = [];
    
    for (const line of lines) {
      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 5) continue;
      
      const year = parseInt(values[0]);
      if (isNaN(year)) continue;
      
      const yearData = createEmptyYearlyData(year);
      yearData.net_sales = parseFloat(values[1]) || 0;
      yearData.food_cost = parseFloat(values[2]) || 0;
      yearData.paper_cost = parseFloat(values[3]) || 0;
      yearData.crew_labor = parseFloat(values[4]) || 0;
      
      // Add all other required fields with default values
      yearData.other_revenue = parseFloat(values[5]) || 0;
      yearData.food_employees = parseFloat(values[6]) || 0;
      yearData.waste = parseFloat(values[7]) || 0;
      yearData.management_labor = parseFloat(values[8]) || 0;
      yearData.social_security = parseFloat(values[9]) || 0;
      yearData.travel_expenses = parseFloat(values[10]) || 0;
      yearData.advertising = parseFloat(values[11]) || 0;
      yearData.promotion = parseFloat(values[12]) || 0;
      yearData.external_services = parseFloat(values[13]) || 0;
      yearData.uniforms = parseFloat(values[14]) || 0;
      yearData.operation_supplies = parseFloat(values[15]) || 0;
      yearData.maintenance = parseFloat(values[16]) || 0;
      yearData.utilities = parseFloat(values[17]) || 0;
      yearData.office_expenses = parseFloat(values[18]) || 0;
      yearData.cash_differences = parseFloat(values[19]) || 0;
      yearData.other_controllable = parseFloat(values[20]) || 0;
      yearData.pac = parseFloat(values[21]) || 0;
      yearData.rent = parseFloat(values[22]) || 0;
      yearData.additional_rent = parseFloat(values[23]) || 0;
      yearData.royalty = parseFloat(values[24]) || 0;
      yearData.office_legal = parseFloat(values[25]) || 0;
      yearData.insurance = parseFloat(values[26]) || 0;
      yearData.taxes_licenses = parseFloat(values[27]) || 0;
      yearData.depreciation = parseFloat(values[28]) || 0;
      yearData.interest = parseFloat(values[29]) || 0;
      yearData.other_non_controllable = parseFloat(values[30]) || 0;
      yearData.non_product_sales = parseFloat(values[31]) || 0;
      yearData.non_product_cost = parseFloat(values[32]) || 0;
      yearData.draw_salary = parseFloat(values[33]) || 0;
      yearData.general_expenses = parseFloat(values[34]) || 0;
      yearData.loan_payment = parseFloat(values[35]) || 0;
      yearData.investment_own_funds = parseFloat(values[36]) || 0;
      
      results.push(yearData);
    }
    
    return results;
  } catch (error) {
    showError('Error procesando los datos importados');
    return [];
  }
};

export const downloadTemplate = () => {
  const csvContent = "data:text/csv;charset=utf-8,Año,Ventas Netas,Coste Comida,Coste Papel,Mano de Obra\n2023,100000,30000,5000,25000\n2024,110000,32000,5500,27000";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "plantilla_datos_historicos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const processImportData = (rawData: string): YearlyData[] => {
  return parseDataFromText(rawData);
};

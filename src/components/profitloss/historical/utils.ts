
import { YearlyData } from './types';
import { ProfitLossFormData } from '@/types/profitLoss';
import { toast } from 'sonner';

export const createEmptyYearlyData = (year: number): YearlyData => ({
  year,
  net_sales: 0,
  other_revenue: 0,
  food_cost: 0,
  food_employees: 0,
  waste: 0,
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
});

export const parseDataFromText = (text: string, separator: string = '\t'): YearlyData[] => {
  try {
    const lines = text.trim().split('\n');
    const data: YearlyData[] = [];

    // Saltar la primera línea si parece ser headers
    const startIndex = lines[0]?.toLowerCase().includes('año') || lines[0]?.toLowerCase().includes('year') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(separator);
      if (values.length >= 2) {
        const yearData: YearlyData = {
          year: parseInt(values[0]?.replace(/[^\d]/g, '')) || new Date().getFullYear(),
          net_sales: parseFloat(values[1]?.replace(/[^\d.-]/g, '')) || 0,
          other_revenue: parseFloat(values[2]?.replace(/[^\d.-]/g, '')) || 0,
          food_cost: parseFloat(values[3]?.replace(/[^\d.-]/g, '')) || 0,
          food_employees: parseFloat(values[4]?.replace(/[^\d.-]/g, '')) || 0,
          waste: parseFloat(values[5]?.replace(/[^\d.-]/g, '')) || 0,
          paper_cost: parseFloat(values[6]?.replace(/[^\d.-]/g, '')) || 0,
          crew_labor: parseFloat(values[7]?.replace(/[^\d.-]/g, '')) || 0,
          management_labor: parseFloat(values[8]?.replace(/[^\d.-]/g, '')) || 0,
          social_security: parseFloat(values[9]?.replace(/[^\d.-]/g, '')) || 0,
          travel_expenses: parseFloat(values[10]?.replace(/[^\d.-]/g, '')) || 0,
          advertising: parseFloat(values[11]?.replace(/[^\d.-]/g, '')) || 0,
          promotion: parseFloat(values[12]?.replace(/[^\d.-]/g, '')) || 0,
          external_services: parseFloat(values[13]?.replace(/[^\d.-]/g, '')) || 0,
          uniforms: parseFloat(values[14]?.replace(/[^\d.-]/g, '')) || 0,
          operation_supplies: parseFloat(values[15]?.replace(/[^\d.-]/g, '')) || 0,
          maintenance: parseFloat(values[16]?.replace(/[^\d.-]/g, '')) || 0,
          utilities: parseFloat(values[17]?.replace(/[^\d.-]/g, '')) || 0,
          office_expenses: parseFloat(values[18]?.replace(/[^\d.-]/g, '')) || 0,
          cash_differences: parseFloat(values[19]?.replace(/[^\d.-]/g, '')) || 0,
          other_controllable: parseFloat(values[20]?.replace(/[^\d.-]/g, '')) || 0,
          pac: parseFloat(values[21]?.replace(/[^\d.-]/g, '')) || 0,
          rent: parseFloat(values[22]?.replace(/[^\d.-]/g, '')) || 0,
          additional_rent: parseFloat(values[23]?.replace(/[^\d.-]/g, '')) || 0,
          royalty: parseFloat(values[24]?.replace(/[^\d.-]/g, '')) || 0,
          office_legal: parseFloat(values[25]?.replace(/[^\d.-]/g, '')) || 0,
          insurance: parseFloat(values[26]?.replace(/[^\d.-]/g, '')) || 0,
          taxes_licenses: parseFloat(values[27]?.replace(/[^\d.-]/g, '')) || 0,
          depreciation: parseFloat(values[28]?.replace(/[^\d.-]/g, '')) || 0,
          interest: parseFloat(values[29]?.replace(/[^\d.-]/g, '')) || 0,
          other_non_controllable: parseFloat(values[30]?.replace(/[^\d.-]/g, '')) || 0,
          non_product_sales: parseFloat(values[31]?.replace(/[^\d.-]/g, '')) || 0,
          non_product_cost: parseFloat(values[32]?.replace(/[^\d.-]/g, '')) || 0,
          draw_salary: parseFloat(values[33]?.replace(/[^\d.-]/g, '')) || 0,
          general_expenses: parseFloat(values[34]?.replace(/[^\d.-]/g, '')) || 0,
          loan_payment: parseFloat(values[35]?.replace(/[^\d.-]/g, '')) || 0,
          investment_own_funds: parseFloat(values[36]?.replace(/[^\d.-]/g, '')) || 0
        };
        data.push(yearData);
      }
    }

    return data;
  } catch (error) {
    console.error('Error parsing data:', error);
    throw new Error('Error al procesar los datos');
  }
};

export const convertToMonthlyData = (yearData: YearlyData, restaurantId: string): ProfitLossFormData[] => {
  const monthlyDataList: ProfitLossFormData[] = [];
  
  for (let month = 1; month <= 12; month++) {
    const monthlyData: ProfitLossFormData = {
      restaurant_id: restaurantId,
      year: yearData.year,
      month: month,
      net_sales: yearData.net_sales / 12,
      other_revenue: yearData.other_revenue / 12,
      food_cost: (yearData.food_cost + yearData.food_employees + yearData.waste) / 12,
      paper_cost: yearData.paper_cost / 12,
      management_labor: yearData.management_labor / 12,
      crew_labor: yearData.crew_labor / 12,
      benefits: yearData.social_security / 12,
      rent: yearData.rent / 12,
      utilities: yearData.utilities / 12,
      maintenance: yearData.maintenance / 12,
      advertising: (yearData.advertising + yearData.promotion) / 12,
      insurance: yearData.insurance / 12,
      supplies: yearData.operation_supplies / 12,
      other_expenses: (yearData.travel_expenses + yearData.external_services + 
                      yearData.uniforms + yearData.office_expenses + 
                      yearData.cash_differences + yearData.other_controllable + 
                      yearData.office_legal + yearData.taxes_licenses + 
                      yearData.other_non_controllable + yearData.general_expenses) / 12,
      franchise_fee: yearData.royalty / 12,
      advertising_fee: yearData.pac / 12,
      rent_percentage: yearData.additional_rent / 12,
      notes: `Datos históricos del año ${yearData.year} (mes ${month})`
    };
    monthlyDataList.push(monthlyData);
  }
  
  return monthlyDataList;
};

export const downloadTemplate = () => {
  const headers = [
    'Año', 'Ventas_Netas', 'Otros_Ingresos', 'Costo_Comida', 'Comida_Empleados', 
    'Desperdicios', 'Papel', 'Mano_Obra', 'Gerencia', 'Seguridad_Social', 
    'Gastos_Viaje', 'Publicidad', 'Promoción', 'Servicios_Exteriores', 
    'Uniformes', 'Suministros', 'Mantenimiento', 'Servicios_Publicos', 
    'Gastos_Oficina', 'Diferencias_Caja', 'Otros_Controlables', 'PAC', 
    'Renta', 'Renta_Adicional', 'Royalty', 'Oficina_Legal', 'Seguros', 
    'Tasas_Licencias', 'Depreciaciones', 'Intereses', 'Otros_No_Controlables',
    'Ventas_No_Producto', 'Costo_No_Producto', 'Draw_Salary', 'Gastos_Generales',
    'Pago_Prestamo', 'Inversiones_Propias'
  ];

  const csvContent = headers.join('\t') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_datos_historicos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

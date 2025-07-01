
import { showError } from '@/utils/notifications';

export interface YearlyData {
  year: number;
  data: MonthlyProfitLoss[];
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
    data: Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      net_sales: 0,
      other_revenue: 0,
      food_cost: 0,
      paper_cost: 0,
      management_labor: 0,
      crew_labor: 0,
      benefits: 0,
      rent: 0,
      utilities: 0,
      maintenance: 0,
      advertising: 0,
      insurance: 0,
      supplies: 0,
      other_expenses: 0,
      franchise_fee: 0,
      advertising_fee: 0,
      rent_percentage: 0,
    }))
  };
};

export const validateYearlyData = (data: YearlyData): boolean => {
  if (!data.year || data.year < 2000 || data.year > 2050) {
    showError('Año inválido');
    return false;
  }

  if (!data.data || data.data.length !== 12) {
    showError('Datos mensuales incompletos');
    return false;
  }

  for (const monthData of data.data) {
    if (monthData.month < 1 || monthData.month > 12) {
      showError('Mes inválido');
      return false;
    }
  }

  return true;
};

export const processImportData = (rawData: string): YearlyData[] => {
  try {
    const lines = rawData.split('\n').filter(line => line.trim());
    const results: YearlyData[] = [];
    
    for (const line of lines) {
      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 5) continue;
      
      const year = parseInt(values[0]);
      const month = parseInt(values[1]);
      const net_sales = parseFloat(values[2]) || 0;
      const food_cost = parseFloat(values[3]) || 0;
      const paper_cost = parseFloat(values[4]) || 0;
      const crew_labor = parseFloat(values[5]) || 0;
      
      let yearData = results.find(y => y.year === year);
      if (!yearData) {
        yearData = createEmptyYearlyData(year);
        results.push(yearData);
      }
      
      const monthIndex = month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        yearData.data[monthIndex] = {
          ...yearData.data[monthIndex],
          net_sales,
          food_cost,
          paper_cost,
          crew_labor
        };
      }
    }
    
    return results;
  } catch (error) {
    showError('Error procesando los datos importados');
    return [];
  }
};

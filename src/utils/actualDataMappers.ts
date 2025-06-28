
import { ActualData } from '@/types/actualDataTypes';

export const getMonthKey = (month: number): string | null => {
  const monthMap: { [key: number]: string } = {
    1: 'jan', 2: 'feb', 3: 'mar', 4: 'apr', 5: 'may', 6: 'jun',
    7: 'jul', 8: 'aug', 9: 'sep', 10: 'oct', 11: 'nov', 12: 'dec'
  };
  return monthMap[month] || null;
};

export const getMonthNumber = (monthKey: string): number | null => {
  const monthMap: { [key: string]: number } = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  };
  return monthMap[monthKey] || null;
};

export const getFieldMapping = (category: string, subcategory: string): string | null => {
  const mappings: { [key: string]: string } = {
    'Ingresos por Ventas-Ventas Netas': 'net_sales',
    'Ingresos por Ventas-Otros Ingresos': 'other_revenue',
    'Costos de Ventas-Costo de Alimentos': 'food_cost',
    'Costos de Ventas-Costo de Papel': 'paper_cost',
    'Gastos de Personal-Trabajo de Gestión': 'management_labor',
    'Gastos de Personal-Trabajo de Equipo': 'crew_labor',
    'Gastos de Personal-Beneficios': 'benefits',
    'Gastos Operativos-Alquiler': 'rent',
    'Gastos Operativos-Servicios Públicos': 'utilities',
    'Gastos Operativos-Mantenimiento': 'maintenance',
    'Gastos Operativos-Publicidad': 'advertising',
    'Gastos Operativos-Seguro': 'insurance',
    'Gastos Operativos-Suministros': 'supplies',
    'Gastos Operativos-Otros Gastos': 'other_expenses',
    'Tarifas McDonald\'s-Tarifa de Franquicia': 'franchise_fee',
    'Tarifas McDonald\'s-Tarifa de Publicidad': 'advertising_fee',
    'Tarifas McDonald\'s-Porcentaje de Alquiler': 'rent_percentage'
  };
  return mappings[`${category}-${subcategory}`] || null;
};

export const groupDataByCategories = (data: any[]): { [key: string]: ActualData } => {
  const groupedData: { [key: string]: ActualData } = {};

  data.forEach(record => {
    const categories = [
      { key: 'Ingresos por Ventas', subcategory: 'Ventas Netas', value: record.net_sales },
      { key: 'Ingresos por Ventas', subcategory: 'Otros Ingresos', value: record.other_revenue },
      { key: 'Costos de Ventas', subcategory: 'Costo de Alimentos', value: record.food_cost },
      { key: 'Costos de Ventas', subcategory: 'Costo de Papel', value: record.paper_cost },
      { key: 'Gastos de Personal', subcategory: 'Trabajo de Gestión', value: record.management_labor },
      { key: 'Gastos de Personal', subcategory: 'Trabajo de Equipo', value: record.crew_labor },
      { key: 'Gastos de Personal', subcategory: 'Beneficios', value: record.benefits },
      { key: 'Gastos Operativos', subcategory: 'Alquiler', value: record.rent },
      { key: 'Gastos Operativos', subcategory: 'Servicios Públicos', value: record.utilities },
      { key: 'Gastos Operativos', subcategory: 'Mantenimiento', value: record.maintenance },
      { key: 'Gastos Operativos', subcategory: 'Publicidad', value: record.advertising },
      { key: 'Gastos Operativos', subcategory: 'Seguro', value: record.insurance },
      { key: 'Gastos Operativos', subcategory: 'Suministros', value: record.supplies },
      { key: 'Gastos Operativos', subcategory: 'Otros Gastos', value: record.other_expenses },
      { key: 'Tarifas McDonald\'s', subcategory: 'Tarifa de Franquicia', value: record.franchise_fee },
      { key: 'Tarifas McDonald\'s', subcategory: 'Tarifa de Publicidad', value: record.advertising_fee },
      { key: 'Tarifas McDonald\'s', subcategory: 'Porcentaje de Alquiler', value: record.rent_percentage }
    ];

    categories.forEach(cat => {
      const key = `${cat.key}-${cat.subcategory}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          id: key,
          category: cat.key,
          subcategory: cat.subcategory,
          jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
          jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
          total: 0
        };
      }

      const monthKey = getMonthKey(record.month);
      if (monthKey) {
        const currentValue = groupedData[key][monthKey as keyof Omit<ActualData, 'id' | 'category' | 'subcategory' | 'total'>] as number;
        (groupedData[key] as any)[monthKey] = currentValue + (cat.value || 0);
      }
    });
  });

  return groupedData;
};

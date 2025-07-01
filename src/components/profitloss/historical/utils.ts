import { YearlyData } from './types';
import { showError } from '@/utils/notifications';

export const parseDataFromText = (text: string, separator: string = '\t'): YearlyData[] => {
  try {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(separator).map(header => header.trim().toLowerCase());
    const data: YearlyData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map(value => value.trim());
      if (values.length !== headers.length) continue;

      const yearIndex = headers.indexOf('year');
      const netSalesIndex = headers.indexOf('net_sales');
      const foodCostIndex = headers.indexOf('food_cost');
      const paperCostIndex = headers.indexOf('paper_cost');
      const crewLaborIndex = headers.indexOf('crew_labor');

      if (yearIndex === -1 || netSalesIndex === -1 || foodCostIndex === -1 || paperCostIndex === -1 || crewLaborIndex === -1) {
        console.warn('Missing required columns in data:', headers);
        continue;
      }

      const year = parseInt(values[yearIndex]);
      const net_sales = parseFloat(values[netSalesIndex].replace(/,/g, ''));
      const food_cost = parseFloat(values[foodCostIndex].replace(/,/g, ''));
      const paper_cost = parseFloat(values[paperCostIndex].replace(/,/g, ''));
      const crew_labor = parseFloat(values[crewLaborIndex].replace(/,/g, ''));

      if (isNaN(year) || isNaN(net_sales) || isNaN(food_cost) || isNaN(paper_cost) || isNaN(crew_labor)) {
        console.warn('Invalid data format in row:', values);
        continue;
      }

      data.push({
        year,
        net_sales,
        food_cost,
        paper_cost,
        crew_labor
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing data from text:', error);
    showError('Error al procesar los datos del texto');
    throw error;
  }
};

export const downloadTemplate = () => {
  try {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "year\tnet_sales\tfood_cost\tpaper_cost\tcrew_labor\n"
      + "2022\t1000000\t250000\t50000\t150000\n"
      + "2023\t1100000\t270000\t55000\t160000";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "profit_loss_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading template:', error);
    showError('Error al descargar la plantilla');
  }
};

export const isValidYear = (year: number): boolean => {
  return year >= 2000 && year <= 2030;
};

export const isValidNumber = (value: number): boolean => {
  return !isNaN(value) && isFinite(value);
};

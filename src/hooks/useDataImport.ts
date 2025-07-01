import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface ImportData {
  year: number;
  month: number;
  net_sales: number;
  food_cost: number;
  paper_cost: number;
  crew_labor: number;
  management_salary: number;
  rent: number;
  royalties: number;
  advertising: number;
  other_expenses: number;
}

export const useDataImport = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const importData = async (data: ImportData[], siteNumber: string) => {
    try {
      setImporting(true);
      setProgress(0);

      const totalRecords = data.length;
      
      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        
        const { error } = await supabase
          .from('historical_data')
          .upsert({
            ...record,
            site_number: siteNumber,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        
        setProgress(((i + 1) / totalRecords) * 100);
      }

      showSuccess(`${totalRecords} registros importados correctamente`);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      showError('Error al importar los datos');
      return false;
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const validateData = (data: any[]): ImportData[] => {
    try {
      const validatedData = data.map(record => {
        // Validar que los campos requeridos existan
        if (
          !record.year ||
          !record.month ||
          !record.net_sales ||
          !record.food_cost ||
          !record.paper_cost ||
          !record.crew_labor ||
          !record.management_salary ||
          !record.rent ||
          !record.royalties ||
          !record.advertising ||
          !record.other_expenses
        ) {
          throw new Error('Faltan campos requeridos en el registro');
        }
  
        // Convertir los campos numéricos a números
        record.year = parseInt(record.year, 10);
        record.month = parseInt(record.month, 10);
        record.net_sales = parseFloat(record.net_sales);
        record.food_cost = parseFloat(record.food_cost);
        record.paper_cost = parseFloat(record.paper_cost);
        record.crew_labor = parseFloat(record.crew_labor);
        record.management_salary = parseFloat(record.management_salary);
        record.rent = parseFloat(record.rent);
        record.royalties = parseFloat(record.royalties);
        record.advertising = parseFloat(record.advertising);
        record.other_expenses = parseFloat(record.other_expenses);
  
        // Validar que los campos numéricos sean números válidos
        if (
          isNaN(record.year) ||
          isNaN(record.month) ||
          isNaN(record.net_sales) ||
          isNaN(record.food_cost) ||
          isNaN(record.paper_cost) ||
          isNaN(record.crew_labor) ||
          isNaN(record.management_salary) ||
          isNaN(record.rent) ||
          isNaN(record.royalties) ||
          isNaN(record.advertising) ||
          isNaN(record.other_expenses)
        ) {
          throw new Error('Los campos numéricos deben ser números válidos');
        }
        return record;
      });

      return validatedData;
    } catch (error) {
      console.error('Error validating data:', error);
      showError('Error al validar los datos de importación');
      throw error;
    }
  };

  return {
    importing,
    progress,
    importData,
    validateData
  };
};

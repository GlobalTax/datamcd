
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

export const useDataImport = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const importData = async (data: any[], restaurantId: string) => {
    try {
      setImporting(true);
      setProgress(0);

      if (!data || data.length === 0) {
        showError('No hay datos para importar');
        return false;
      }

      // Simulate import progress
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        
        // Import to profit_loss_data table
        const { error } = await supabase
          .from('profit_loss_data')
          .upsert({
            restaurant_id: restaurantId,
            year: item.year,
            month: item.month || 1,
            net_sales: item.net_sales || 0,
            food_cost: item.food_cost || 0,
            paper_cost: item.paper_cost || 0,
            crew_labor: item.crew_labor || 0,
            management_labor: item.management_labor || 0,
            benefits: item.benefits || 0,
            rent: item.rent || 0,
            utilities: item.utilities || 0,
            advertising: item.advertising || 0,
            insurance: item.insurance || 0,
            supplies: item.supplies || 0,
            other_expenses: item.other_expenses || 0,
            franchise_fee: item.franchise_fee || 0,
            advertising_fee: item.advertising_fee || 0,
            rent_percentage: item.rent_percentage || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error importing item:', error);
          continue;
        }

        setProgress(((i + 1) / data.length) * 100);
      }

      showSuccess(`${data.length} registros importados correctamente`);
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

  return {
    importing,
    progress,
    importData
  };
};

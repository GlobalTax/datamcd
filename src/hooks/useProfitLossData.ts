
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

export interface ProfitLossData {
  id: string;
  restaurant_id: string;
  year: number;
  month: number;
  net_sales: number;
  other_revenue: number;
  total_revenue: number;
  food_cost: number;
  paper_cost: number;
  total_cost_of_sales: number;
  management_labor: number;
  crew_labor: number;
  benefits: number;
  total_labor: number;
  rent: number;
  utilities: number;
  maintenance: number;
  advertising: number;
  insurance: number;
  supplies: number;
  other_expenses: number;
  total_operating_expenses: number;
  franchise_fee: number;
  advertising_fee: number;
  rent_percentage: number;
  total_mcdonalds_fees: number;
  gross_profit: number;
  operating_income: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  notes?: string;
}

export const useProfitLossData = (restaurantId: string) => {
  const [data, setData] = useState<ProfitLossData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: profitLossData, error } = await supabase
        .from('profit_loss_data')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('year', { ascending: false })
        .order('month', { ascending: true });

      if (error) throw error;
      
      setData(profitLossData || []);
    } catch (error) {
      console.error('Error fetching profit loss data:', error);
      showError('Error al cargar los datos de P&L');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (profitLossData: ProfitLossData[]) => {
    try {
      setSaving(true);
      
      for (const data of profitLossData) {
        const { error } = await supabase
          .from('profit_loss_data')
          .upsert({
            ...data,
            restaurant_id: restaurantId,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      showSuccess('Datos de P&L guardados correctamente');
      await fetchData();
    } catch (error) {
      console.error('Error saving profit loss data:', error);
      showError('Error al guardar los datos de P&L');
    } finally {
      setSaving(false);
    }
  };

  const refetch = async () => {
    await fetchData();
  };

  useEffect(() => {
    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  return {
    data,
    loading,
    saving,
    saveData,
    refetch
  };
};

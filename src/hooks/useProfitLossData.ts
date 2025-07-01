import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

export interface ProfitLossData {
  id: string;
  site_number: string;
  year: number;
  month: number;
  net_sales: number;
  food_cost: number;
  paper_cost: number;
  crew_labor: number;
  management_salary: number;
  payroll_taxes: number;
  benefits: number;
  rent: number;
  utilities: number;
  marketing: number;
  other_expenses: number;
  created_at: string;
  updated_at: string;
}

export const useProfitLossData = (siteNumber: string) => {
  const [data, setData] = useState<ProfitLossData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: profitLossData, error } = await supabase
        .from('profit_loss_data')
        .select('*')
        .eq('site_number', siteNumber)
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
            site_number: siteNumber,
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

  useEffect(() => {
    if (siteNumber) {
      fetchData();
    }
  }, [siteNumber]);

  return {
    data,
    loading,
    saving,
    saveData,
    refetch: fetchData
  };
};

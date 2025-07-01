import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

export interface MonthlyData {
  id: string;
  site_number: string;
  year: number;
  month: number;
  net_sales: number;
  food_cost: number;
  paper_cost: number;
  crew_labor: number;
  management_salary: number;
  other_labor: number;
  rent: number;
  utilities: number;
  marketing: number;
  supplies: number;
  other_expenses: number;
  created_at: string;
  updated_at: string;
}

export const useActualData = (siteNumber: string) => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: actualData, error } = await supabase
        .from('actual_data')
        .select('*')
        .eq('site_number', siteNumber)
        .order('year', { ascending: false })
        .order('month', { ascending: true });

      if (error) throw error;

      setData(actualData || []);
    } catch (error) {
      console.error('Error fetching actual data:', error);
      showError('Error al cargar los datos actuales');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (monthlyData: MonthlyData[]) => {
    try {
      setSaving(true);
      
      for (const data of monthlyData) {
        const { error } = await supabase
          .from('actual_data')
          .upsert({
            ...data,
            site_number: siteNumber,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      showSuccess('Datos guardados correctamente');
      await fetchData();
    } catch (error) {
      console.error('Error saving actual data:', error);
      showError('Error al guardar los datos');
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

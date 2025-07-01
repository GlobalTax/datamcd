
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
      // Utilizamos monthly_tracking en lugar de actual_data
      const { data: actualData, error } = await supabase
        .from('monthly_tracking')
        .select('*')
        .eq('franchisee_restaurant_id', siteNumber)
        .order('year', { ascending: false })
        .order('month', { ascending: true });

      if (error) throw error;

      // Mapear los datos a la estructura esperada
      const mappedData: MonthlyData[] = (actualData || []).map(item => ({
        id: item.id,
        site_number: siteNumber,
        year: item.year,
        month: item.month,
        net_sales: item.actual_revenue || 0,
        food_cost: item.actual_food_cost || 0,
        paper_cost: 0, // No disponible en monthly_tracking
        crew_labor: item.actual_labor_cost || 0,
        management_salary: 0, // No disponible en monthly_tracking
        other_labor: 0, // No disponible en monthly_tracking
        rent: item.actual_rent || 0,
        utilities: item.actual_utilities || 0,
        marketing: item.actual_marketing || 0,
        supplies: 0, // No disponible en monthly_tracking
        other_expenses: item.actual_other_expenses || 0,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setData(mappedData);
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
          .from('monthly_tracking')
          .upsert({
            id: data.id,
            franchisee_restaurant_id: siteNumber,
            year: data.year,
            month: data.month,
            actual_revenue: data.net_sales,
            actual_food_cost: data.food_cost,
            actual_labor_cost: data.crew_labor,
            actual_rent: data.rent,
            actual_utilities: data.utilities,
            actual_marketing: data.marketing,
            actual_other_expenses: data.other_expenses,
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

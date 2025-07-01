import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface BudgetData {
  [key: string]: any;
}

export interface Budget {
  id: string;
  restaurant_id: string;
  year: number;
  budget_data: BudgetData;
  created_at: string;
  updated_at: string;
}

export const useBudgetData = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveBudgetData = async (
    restaurantId: string,
    year: number,
    budgetData: BudgetData
  ) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('budget_data')
        .upsert({
          restaurant_id: restaurantId,
          year,
          ...budgetData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      showSuccess('Presupuesto guardado correctamente');
      return true;
    } catch (error) {
      console.error('Error saving budget:', error);
      showError('Error al guardar el presupuesto');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const loadBudgetData = async (restaurantId: string, year: number): Promise<BudgetData | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('budget_data')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('year', year)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error loading budget:', error);
      showError('Error al cargar el presupuesto');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saving,
    saveBudgetData,
    loadBudgetData
  };
};

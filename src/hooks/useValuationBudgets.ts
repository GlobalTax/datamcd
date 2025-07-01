import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

export interface ValuationBudget {
  id: string;
  created_at: string;
  updated_at: string;
  restaurant_id: string;
  year: number;
  budget_data: any;
}

export const useValuationBudgets = () => {
  const [budgets, setBudgets] = useState<ValuationBudget[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('valuation_budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching valuation budgets:', error);
      showError('Error al cargar los presupuestos de valoración');
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async (budgetData: Omit<ValuationBudget, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('valuation_budgets')
        .upsert(budgetData);

      if (error) throw error;
      
      showSuccess('Presupuesto de valoración guardado correctamente');
      await fetchBudgets();
    } catch (error) {
      console.error('Error saving valuation budget:', error);
      showError('Error al guardar el presupuesto de valoración');
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('valuation_budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showSuccess('Presupuesto eliminado correctamente');
      await fetchBudgets();
    } catch (error) {
      console.error('Error deleting valuation budget:', error);
      showError('Error al eliminar el presupuesto');
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  return {
    budgets,
    loading,
    saveBudget,
    deleteBudget,
    refetch: fetchBudgets
  };
};

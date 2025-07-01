import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { showSuccess, showError } from '@/utils/notifications';

interface BudgetData {
  [key: string]: number;
}

interface AnnualBudget {
  id: string;
  created_at: string;
  updated_at: string;
  year: number;
  restaurant_id: string;
  user_id: string;
  budget_data: BudgetData;
}

export const useAnnualBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<AnnualBudget[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBudgets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('annual_budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      showError('Error al cargar los presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async (budgetData: Omit<AnnualBudget, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('annual_budgets')
        .upsert({
          ...budgetData,
          user_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      showSuccess('Presupuesto guardado correctamente');
      await fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      showError('Error al guardar el presupuesto');
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('annual_budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showSuccess('Presupuesto eliminado correctamente');
      await fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      showError('Error al eliminar el presupuesto');
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  return {
    budgets,
    loading,
    saveBudget,
    deleteBudget,
    refetch: fetchBudgets
  };
};

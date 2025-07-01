
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { showSuccess, showError } from '@/utils/notifications';

interface AnnualBudget {
  id: string;
  created_at: string;
  updated_at: string;
  year: number;
  restaurant_id: string;
  category: string;
  subcategory?: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  created_by?: string;
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
        .order('year', { ascending: false });

      if (error) throw error;

      // Mapear los datos desde la base de datos
      const mappedBudgets: AnnualBudget[] = (data || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        year: item.year,
        restaurant_id: item.restaurant_id,
        category: item.category,
        subcategory: item.subcategory,
        jan: item.jan || 0,
        feb: item.feb || 0,
        mar: item.mar || 0,
        apr: item.apr || 0,
        may: item.may || 0,
        jun: item.jun || 0,
        jul: item.jul || 0,
        aug: item.aug || 0,
        sep: item.sep || 0,
        oct: item.oct || 0,
        nov: item.nov || 0,
        dec: item.dec || 0,
        created_by: item.created_by
      }));

      setBudgets(mappedBudgets);
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
          created_by: user.id,
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

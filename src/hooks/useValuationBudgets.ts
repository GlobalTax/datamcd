
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

export interface ValuationBudget {
  id: string;
  franchisee_restaurant_id: string;
  budget_name: string;
  budget_year: number;
  initial_sales: number;
  status: string;
  notes: string | null;
  discount_rate: number;
  years_projection: number;
  sales_growth_rate: number | null;
  inflation_rate: number | null;
  pac_percentage: number | null;
  rent_percentage: number | null;
  service_fees_percentage: number | null;
  depreciation: number | null;
  interest: number | null;
  loan_payment: number | null;
  rent_index: number | null;
  miscellaneous: number | null;
  final_valuation: number | null;
  projected_cash_flows: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
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
        .upsert({
          franchisee_restaurant_id: budgetData.franchisee_restaurant_id,
          budget_name: budgetData.budget_name,
          budget_year: budgetData.budget_year,
          initial_sales: budgetData.initial_sales,
          discount_rate: budgetData.discount_rate,
          status: budgetData.status || 'draft',
          notes: budgetData.notes,
          years_projection: budgetData.years_projection || 5,
          sales_growth_rate: budgetData.sales_growth_rate,
          inflation_rate: budgetData.inflation_rate,
          pac_percentage: budgetData.pac_percentage,
          rent_percentage: budgetData.rent_percentage,
          service_fees_percentage: budgetData.service_fees_percentage,
          depreciation: budgetData.depreciation,
          interest: budgetData.interest,
          loan_payment: budgetData.loan_payment,
          rent_index: budgetData.rent_index,
          miscellaneous: budgetData.miscellaneous,
          final_valuation: budgetData.final_valuation,
          projected_cash_flows: budgetData.projected_cash_flows,
          created_by: budgetData.created_by
        });

      if (error) throw error;
      
      showSuccess('Presupuesto de valoración guardado correctamente');
      await fetchBudgets();
    } catch (error) {
      console.error('Error saving valuation budget:', error);
      showError('Error al guardar el presupuesto de valoración');
    }
  };

  const createBudget = async (budgetData: Omit<ValuationBudget, 'id' | 'created_at' | 'updated_at'>) => {
    return await saveBudget(budgetData);
  };

  const updateBudget = async (id: string, budgetData: Partial<ValuationBudget>) => {
    try {
      const { error } = await supabase
        .from('valuation_budgets')
        .update(budgetData)
        .eq('id', id);

      if (error) throw error;
      
      showSuccess('Presupuesto actualizado correctamente');
      await fetchBudgets();
      return true;
    } catch (error) {
      console.error('Error updating valuation budget:', error);
      showError('Error al actualizar el presupuesto');
      return false;
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
      return true;
    } catch (error) {
      console.error('Error deleting valuation budget:', error);
      showError('Error al eliminar el presupuesto');
      return false;
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  return {
    budgets,
    loading,
    saveBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets
  };
};

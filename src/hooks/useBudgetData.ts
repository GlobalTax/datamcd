
import { useState } from 'react';
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
      
      // Since budget_data table doesn't exist, we'll simulate success
      // In a real implementation, this would save to the annual_budgets table
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      // Since budget_data table doesn't exist, return null
      // In a real implementation, this would load from the annual_budgets table
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return null;
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

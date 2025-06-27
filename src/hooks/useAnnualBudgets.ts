
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/AuthProvider';
import { toast } from 'sonner';
import { BudgetData } from '@/types/budgetTypes';

// Interfaz que coincide con la tabla annual_budgets de la base de datos
interface AnnualBudgetRow {
  id: string;
  restaurant_id: string;
  year: number;
  category: string;
  subcategory: string | null;
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
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

interface UseAnnualBudgetsResult {
  budgets: AnnualBudgetRow[];
  loading: boolean;
  error: Error | null;
  fetchBudgets: (restaurantId: string, year: number) => void;
  saveBudgets: (restaurantId: string, year: number, data: BudgetData[]) => Promise<boolean>;
}

export const useAnnualBudgets = (): UseAnnualBudgetsResult => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [budgets, setBudgets] = useState<AnnualBudgetRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBudgets = async (restaurantId: string, year: number) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('annual_budgets')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('year', year)
        .order('category');

      if (error) {
        throw error;
      }

      setBudgets(data || []);
      return data || [];
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveBudgets = async (restaurantId: string, year: number, data: BudgetData[]): Promise<boolean> => {
    try {
      // Convertir BudgetData[] a formato de base de datos
      const budgetRows = data.map(row => ({
        restaurant_id: restaurantId,
        year: year,
        category: row.category,
        subcategory: row.subcategory || null,
        jan: row.jan || 0,
        feb: row.feb || 0,
        mar: row.mar || 0,
        apr: row.apr || 0,
        may: row.may || 0,
        jun: row.jun || 0,
        jul: row.jul || 0,
        aug: row.aug || 0,
        sep: row.sep || 0,
        oct: row.oct || 0,
        nov: row.nov || 0,
        dec: row.dec || 0,
        created_by: user?.id
      }));

      // Primero eliminar datos existentes para este restaurante y año
      await supabase
        .from('annual_budgets')
        .delete()
        .eq('restaurant_id', restaurantId)
        .eq('year', year);

      // Insertar nuevos datos
      const { error } = await supabase
        .from('annual_budgets')
        .insert(budgetRows);

      if (error) {
        throw error;
      }

      toast.success('Presupuestos guardados correctamente');
      return true;
    } catch (err) {
      console.error('Error saving budgets:', err);
      toast.error('Error al guardar los presupuestos');
      return false;
    }
  };

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    saveBudgets
  };
};

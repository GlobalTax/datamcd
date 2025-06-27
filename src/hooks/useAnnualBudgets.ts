import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/AuthProvider';

interface AnnualBudget {
  id: string;
  restaurant_id: string;
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  created_at: string;
}

interface UseAnnualBudgetsResult {
  budgets: AnnualBudget[] | undefined;
  loading: boolean;
  error: Error | null;
}

export const useAnnualBudgets = (restaurantId: string, year: number): UseAnnualBudgetsResult => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<AnnualBudget[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data, error } = await supabase
          .from('annual_budgets')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('year', year);

        if (error) {
          throw error;
        }

        setBudgets(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [restaurantId, year, user]);

  return { budgets, loading, error };
};


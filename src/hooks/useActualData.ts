
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/AuthProvider';

export interface ActualData {
  id: string;
  restaurant_id: string;
  year: number;
  month: number;
  sales: number;
  food_cost: number;
  labor_cost: number;
  rent: number;
  utilities: number;
  other_expenses: number;
  created_at: string;
  updated_at: string;
}

export const useActualData = (restaurantId?: string, year?: number) => {
  const { user } = useAuth();
  const [actualData, setActualData] = useState<ActualData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActualData = async (): Promise<ActualData[]> => {
    if (!user || !restaurantId) return [];

    try {
      setLoading(true);
      setError(null);

      // Usar monthly_tracking como fuente de datos reales
      let query = supabase
        .from('monthly_tracking')
        .select('*')
        .eq('franchisee_restaurant_id', restaurantId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (year) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Mapear monthly_tracking a ActualData
      const mappedData: ActualData[] = (data || []).map(item => ({
        id: item.id,
        restaurant_id: item.franchisee_restaurant_id || '',
        year: item.year,
        month: item.month,
        sales: item.actual_revenue || 0,
        food_cost: item.actual_food_cost || 0,
        labor_cost: item.actual_labor_cost || 0,
        rent: item.actual_rent || 0,
        utilities: item.actual_utilities || 0,
        other_expenses: item.actual_other_expenses || 0,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setActualData(mappedData);
      return mappedData;
    } catch (err) {
      console.error('Error fetching actual data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const {
    data: queryData,
    isLoading: queryLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['actualData', restaurantId, year],
    queryFn: fetchActualData,
    enabled: !!user && !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (queryData) {
      setActualData(queryData);
    }
  }, [queryData]);

  const updateActualData = async (data: any) => {
    try {
      const { data: updatedData, error } = await supabase
        .from('monthly_tracking')
        .update({
          actual_revenue: data.sales,
          actual_food_cost: data.food_cost,
          actual_labor_cost: data.labor_cost,
          actual_rent: data.rent,
          actual_utilities: data.utilities,
          actual_other_expenses: data.other_expenses,
        })
        .eq('franchisee_restaurant_id', data.restaurant_id)
        .eq('year', data.year)
        .eq('month', data.month)
        .select()
        .single();

      if (error) {
        throw error;
      }

      refetch();
      return { success: true, data: updatedData };
    } catch (err) {
      console.error('Error updating actual data:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      };
    }
  };

  return {
    actualData,
    loading: loading || queryLoading,
    error: error || (queryError instanceof Error ? queryError.message : null),
    fetchActualData,
    updateActualData,
    refetch
  };
};

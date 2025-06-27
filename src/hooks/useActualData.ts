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

  const fetchActualData = async () => {
    if (!user || !restaurantId) return [];

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('actual_data')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (year) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching actual data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
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

  const addActualData = async (data: Omit<ActualData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('actual_data')
        .insert([data])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setActualData(prev => [newData, ...prev]);
      refetch();
      return { success: true, data: newData };
    } catch (err) {
      console.error('Error adding actual data:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      };
    }
  };

  const updateActualData = async (id: string, updates: Partial<ActualData>) => {
    try {
      const { data: updatedData, error } = await supabase
        .from('actual_data')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setActualData(prev => 
        prev.map(item => item.id === id ? updatedData : item)
      );
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

  const deleteActualData = async (id: string) => {
    try {
      const { error } = await supabase
        .from('actual_data')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setActualData(prev => prev.filter(item => item.id !== id));
      refetch();
      return { success: true };
    } catch (err) {
      console.error('Error deleting actual data:', err);
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
    addActualData,
    updateActualData,
    deleteActualData,
    refetch
  };
};

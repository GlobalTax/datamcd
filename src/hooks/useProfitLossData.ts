import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProfitLossData } from '@/types/profitLoss';
import { useAuth } from '@/hooks/AuthProvider';

export const useProfitLossData = (restaurantId: string, year: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [data, setData] = useState<ProfitLossData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfitLossData = async () => {
    if (!restaurantId || !year) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data: plData, error } = await supabase
        .from<ProfitLossData>('profit_loss')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('year', year)
        .order('month', { ascending: true });

      if (error) {
        toast.error('Error al cargar datos de P&L');
        setData([]);
      } else {
        setData(plData || []);
      }
    } catch (error) {
      toast.error('Error inesperado al cargar datos de P&L');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLossData();
  }, [restaurantId, year]);

  const refetch = () => {
    fetchProfitLossData();
  };

  return {
    data,
    loading,
    refetch,
  };
};

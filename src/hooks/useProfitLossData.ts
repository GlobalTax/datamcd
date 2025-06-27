
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProfitLossData, ProfitLossFormData } from '@/types/profitLoss';
import { useAuth } from '@/hooks/AuthProvider';

export const useProfitLossData = (restaurantId?: string, year?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchProfitLossData = async () => {
    if (!restaurantId || !year) {
      return [];
    }

    const { data, error } = await supabase
      .from('profit_loss_data')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('year', year)
      .order('month', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  };

  const {
    data: profitLossData = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['profit-loss-data', restaurantId, year],
    queryFn: fetchProfitLossData,
    enabled: !!user && !!restaurantId && !!year,
  });

  const createProfitLossData = useMutation({
    mutationFn: async (data: ProfitLossFormData) => {
      const { error } = await supabase
        .from('profit_loss_data')
        .insert([data]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-loss-data'] });
      toast.success('Datos de P&L guardados correctamente');
    },
    onError: (error) => {
      console.error('Error creating profit loss data:', error);
      toast.error('Error al guardar los datos de P&L');
    },
  });

  const updateProfitLossData = useMutation({
    mutationFn: async (data: ProfitLossFormData & { id: string }) => {
      const { error } = await supabase
        .from('profit_loss_data')
        .update(data)
        .eq('id', data.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-loss-data'] });
      toast.success('Datos de P&L actualizados correctamente');
    },
    onError: (error) => {
      console.error('Error updating profit loss data:', error);
      toast.error('Error al actualizar los datos de P&L');
    },
  });

  return {
    data: profitLossData,
    profitLossData,
    loading: isLoading,
    isLoading,
    error: error?.message || null,
    refetch,
    createProfitLossData,
    updateProfitLossData
  };
};

// Exportar también el hook de cálculos
export { useProfitLossCalculations } from './useProfitLossCalculations';

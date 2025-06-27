import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfitLossData, ProfitLossFormData, ProfitLossTemplate } from '@/types/profitLoss';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useProfitLossData = (restaurantId?: string, year?: number) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch P&L data
  const {
    data: profitLossData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['profit-loss-data', restaurantId, year, user?.id],
    queryFn: async () => {
      if (!restaurantId || !user) return [];
      
      let query = supabase
        .from('profit_loss_data')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (year) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching P&L data:', error);
        throw error;
      }
      
      return data as ProfitLossData[];
    },
    enabled: !!restaurantId && !!user,
  });

  // Fetch templates
  const {
    data: templates,
    isLoading: templatesLoading
  } = useQuery({
    queryKey: ['profit-loss-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profit_loss_templates')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching P&L templates:', error);
        throw error;
      }

      return data as ProfitLossTemplate[];
    },
  });

  // Create P&L data mutation
  const createProfitLossData = useMutation({
    mutationFn: async (formData: ProfitLossFormData) => {
      const { data, error } = await supabase
        .from('profit_loss_data')
        .insert([{
          ...formData,
          created_by: user?.email || 'system'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating P&L data:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-loss-data'] });
      toast.success('Datos de P&L guardados exitosamente');
    },
    onError: (error: any) => {
      console.error('Error saving P&L data:', error);
      toast.error('Error al guardar los datos de P&L');
    },
  });

  // Update P&L data mutation
  const updateProfitLossData = useMutation({
    mutationFn: async ({ id, ...formData }: ProfitLossFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('profit_loss_data')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating P&L data:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-loss-data'] });
      toast.success('Datos de P&L actualizados exitosamente');
    },
    onError: (error: any) => {
      console.error('Error updating P&L data:', error);
      toast.error('Error al actualizar los datos de P&L');
    },
  });

  // Delete P&L data mutation
  const deleteProfitLossData = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profit_loss_data')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting P&L data:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-loss-data'] });
      toast.success('Datos de P&L eliminados exitosamente');
    },
    onError: (error: any) => {
      console.error('Error deleting P&L data:', error);
      toast.error('Error al eliminar los datos de P&L');
    },
  });

  return {
    profitLossData: profitLossData || [],
    templates: templates || [],
    isLoading: isLoading || templatesLoading,
    error,
    refetch,
    createProfitLossData,
    updateProfitLossData,
    deleteProfitLossData,
  };
};

export const useProfitLossCalculations = () => {
  const calculateMetrics = (data: ProfitLossData) => {
    const grossMargin = data.total_revenue > 0 ? (data.gross_profit / data.total_revenue) * 100 : 0;
    const operatingMargin = data.total_revenue > 0 ? (data.operating_income / data.total_revenue) * 100 : 0;
    const laborPercentage = data.total_revenue > 0 ? (data.total_labor / data.total_revenue) * 100 : 0;
    const foodCostPercentage = data.total_revenue > 0 ? (data.food_cost / data.total_revenue) * 100 : 0;
    const totalExpensePercentage = data.total_revenue > 0 ? 
      ((data.total_cost_of_sales + data.total_labor + data.total_operating_expenses + data.total_mcdonalds_fees) / data.total_revenue) * 100 : 0;

    return {
      grossMargin,
      operatingMargin,
      laborPercentage,
      foodCostPercentage,
      totalExpensePercentage,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  return {
    calculateMetrics,
    formatCurrency,
    formatPercentage,
  };
};

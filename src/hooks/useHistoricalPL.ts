import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { YearlyData } from '@/types/domains/financial';

export interface HistoricalPLRecord {
  id: string;
  restaurant_id: string;
  franchisee_id?: string;
  year: number;
  month?: number;
  period_type: 'monthly' | 'quarterly' | 'annual';
  net_sales: number;
  other_revenue: number;
  food_cost: number;
  food_employees: number;
  waste: number;
  paper_cost: number;
  crew_labor: number;
  management_labor: number;
  social_security: number;
  travel_expenses: number;
  advertising: number;
  promotion: number;
  external_services: number;
  uniforms: number;
  operation_supplies: number;
  maintenance: number;
  utilities: number;
  office_expenses: number;
  cash_differences: number;
  other_controllable: number;
  pac: number;
  rent: number;
  additional_rent: number;
  royalty: number;
  office_legal: number;
  insurance: number;
  taxes_licenses: number;
  depreciation: number;
  interest: number;
  other_non_controllable: number;
  non_product_sales: number;
  non_product_cost: number;
  draw_salary: number;
  general_expenses: number;
  loan_payment: number;
  investment_own_funds: number;
  created_at: string;
  updated_at: string;
}

export const useHistoricalPL = (restaurantId: string) => {
  const queryClient = useQueryClient();

  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['historical-pl', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('historical_profit_loss')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      return data as HistoricalPLRecord[];
    },
    enabled: !!restaurantId,
  });

  const importDataMutation = useMutation({
    mutationFn: async (yearlyDataList: YearlyData[]) => {
      const records = yearlyDataList.map(data => ({
        restaurant_id: restaurantId,
        year: data.year,
        period_type: 'annual' as const,
        ...data,
      }));

      const { data, error } = await supabase
        .from('historical_profit_loss')
        .upsert(records, {
          onConflict: 'restaurant_id,year,month,period_type',
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historical-pl', restaurantId] });
      toast.success('Datos importados correctamente');
    },
    onError: (error) => {
      console.error('Error importing data:', error);
      toast.error('Error al importar los datos');
    },
  });

  const deleteYearMutation = useMutation({
    mutationFn: async (year: number) => {
      const { error } = await supabase
        .from('historical_profit_loss')
        .delete()
        .eq('restaurant_id', restaurantId)
        .eq('year', year);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historical-pl', restaurantId] });
      toast.success('Año eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting year:', error);
      toast.error('Error al eliminar el año');
    },
  });

  return {
    historicalData,
    isLoading,
    importData: importDataMutation.mutate,
    isImporting: importDataMutation.isPending,
    deleteYear: deleteYearMutation.mutate,
  };
};

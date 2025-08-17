import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { BudgetService, AnnualBudgetData } from '@/services/api/budgetService';
import { budgetKeys } from '@/hooks/queryKeys';
import { BudgetData } from '@/types/budgetTypes';
import { getDefaultBudgetStructure } from '@/constants/defaultBudgetStructure';
import { logger } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';
import { useRestaurantContext } from '@/providers/RestaurantContext';

export interface BudgetConfig {
  restaurantId: string;
  year: number;
}

export interface UseBudgetsReturn {
  // Annual Budgets
  annualBudgets: BudgetData[];
  rowData: BudgetData[];
  hasChanges: boolean;
  
  // States
  loading: boolean;
  error: string | null;
  
  // Actions
  refetch: () => void;
  saveAnnualBudgets: (data: BudgetData[]) => void;
  handleCellChange: (id: string, field: string, value: number) => void;
  reloadData: () => void;
}

export const useBudgets = (config: BudgetConfig): UseBudgetsReturn => {
  const { user } = useUnifiedAuth();
  const { restaurantId, year } = config;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Local state for managing grid data and changes
  const [rowData, setRowData] = useState<BudgetData[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Query para obtener presupuestos anuales
  const {
    data: annualBudgets = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: budgetKeys.annual(restaurantId, year),
    queryFn: () => BudgetService.fetchAnnualBudgets(restaurantId, year, user?.id || ''),
    enabled: !!restaurantId && !!year && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutación para guardar presupuestos anuales
  const saveAnnualBudgetsMutation = useMutation({
    mutationFn: (budgetData: BudgetData[]) => 
      BudgetService.saveAnnualBudgets(restaurantId, year, budgetData, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.byRestaurant(restaurantId) });
      toast({
        title: "Éxito",
        description: "Presupuesto guardado correctamente",
      });
    },
    onError: (error: any) => {
      logger.error('Error saving annual budgets', { error });
      toast({
        title: "Error",
        description: error.message || "Error al guardar el presupuesto",
        variant: "destructive",
      });
    },
  });

  const handleCellChange = useCallback((id: string, field: string, value: number) => {
    logger.debug('Cell changed', { id, field, value });
    
    const numericFields = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    if (!numericFields.includes(field)) {
      logger.warn('Field not editable', { field });
      return;
    }
    
    setRowData(prevData => {
      const updatedData = prevData.map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          // Recalculate total
          updatedRow.total = numericFields.reduce((sum, month) => 
            sum + (updatedRow[month as keyof BudgetData] as number || 0), 0
          );
          return updatedRow;
        }
        return row;
      });
      
      setHasChanges(true);
      return updatedData;
    });
    
    toast({
      title: "Éxito",
      description: "Valor actualizado correctamente",
    });
  }, [toast]);

  const reloadData = useCallback(() => {
    setIsInitialized(false);
    setRowData([]);
    setHasChanges(false);
    refetch();
  }, [refetch]);

  // Process annual budgets data when it changes
  useEffect(() => {
    if (annualBudgets.length > 0) {
      logger.debug('Processing annual budgets for grid', { count: annualBudgets.length });
      
      // Convert database data to grid format
      const gridData = annualBudgets.map(budget => ({
        id: budget.id,
        category: budget.category,
        subcategory: budget.subcategory || '',
        isCategory: false,
        jan: budget.jan,
        feb: budget.feb,
        mar: budget.mar,
        apr: budget.apr,
        may: budget.may,
        jun: budget.jun,
        jul: budget.jul,
        aug: budget.aug,
        sep: budget.sep,
        oct: budget.oct,
        nov: budget.nov,
        dec: budget.dec,
        total: budget.jan + budget.feb + budget.mar + budget.apr + budget.may + budget.jun +
               budget.jul + budget.aug + budget.sep + budget.oct + budget.nov + budget.dec
      }));
      setRowData(gridData);
      setIsInitialized(true);
    } else if (isInitialized && !isLoading) {
      logger.debug('No annual budgets found, using default structure');
      setRowData(getDefaultBudgetStructure());
    }
  }, [annualBudgets, isInitialized, isLoading]);

  return {
    // Annual Budgets
    annualBudgets: rowData,
    rowData,
    hasChanges,
    
    // States
    loading: isLoading,
    error: error?.message || null,
    
    // Actions
    refetch,
    saveAnnualBudgets: saveAnnualBudgetsMutation.mutate,
    handleCellChange,
    reloadData
  };
};

// Hook específico que usa el contexto de restaurante
export const useRestaurantBudgets = (year: number) => {
  const { currentRestaurantId } = useRestaurantContext();
  
  if (!currentRestaurantId) {
    throw new Error('useRestaurantBudgets requiere un restaurante seleccionado');
  }
  
  return useBudgets({ restaurantId: currentRestaurantId, year });
};
import { useState, useEffect, useCallback } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { BudgetService, AnnualBudgetData } from '@/services/api/budgetService';

import { BudgetData } from '@/types/budgetTypes';
import { getDefaultBudgetStructure } from '@/constants/defaultBudgetStructure';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

export interface BudgetConfig {
  restaurantId?: string;
  year?: number;
  autoFetch?: boolean;
}

export interface UseBudgetsReturn {
  // Annual Budgets
  annualBudgets: BudgetData[];
  rowData: BudgetData[];
  hasChanges: boolean;
  
  // States
  loading: boolean;
  error: string | null;
  
  // Annual Budget Methods
  fetchAnnualBudgets: (restaurantId: string, year: number) => Promise<void>;
  saveAnnualBudgets: (restaurantId: string, year: number, data: BudgetData[]) => Promise<boolean>;
  handleCellChange: (id: string, field: string, value: number) => void;
  reloadData: () => void;
}

export const useBudgets = (config: BudgetConfig = {}): UseBudgetsReturn => {
  const { user } = useUnifiedAuth();
  const { restaurantId, year, autoFetch = true } = config;
  
  // Annual Budget States
  const [annualBudgets, setAnnualBudgets] = useState<AnnualBudgetData[]>([]);
  const [rowData, setRowData] = useState<BudgetData[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Common States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Annual Budget Methods
  const fetchAnnualBudgets = useCallback(async (restaurantId: string, year: number) => {
    if (!user) {
      logger.warn('No user found for annual budgets fetch');
      return;
    }

    if (loading) {
      logger.debug('Already loading, skipping duplicate annual budgets call');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      logger.info('Fetching annual budgets', { restaurantId, year });
      const data = await BudgetService.fetchAnnualBudgets(restaurantId, year, user.id);
      
      setAnnualBudgets(data);
      logger.info('Annual budgets fetched successfully', { count: data.length });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar los presupuestos';
      logger.error('Error in fetchAnnualBudgets', { error: err });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  const saveAnnualBudgets = useCallback(async (
    restaurantId: string, 
    year: number, 
    budgetData: BudgetData[]
  ): Promise<boolean> => {
    if (!user) {
      logger.warn('No user found for saving annual budgets');
      return false;
    }

    try {
      setLoading(true);
      logger.info('Saving annual budgets', { restaurantId, year, count: budgetData.length });
      
      await BudgetService.saveAnnualBudgets(restaurantId, year, budgetData, user.id);
      
      toast.success('Presupuesto guardado correctamente');
      // Refresh data
      await fetchAnnualBudgets(restaurantId, year);
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el presupuesto';
      logger.error('Error saving annual budgets', { error: err });
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchAnnualBudgets]);

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
    
    toast.success('Valor actualizado correctamente');
  }, []);

  const reloadData = useCallback(() => {
    setIsInitialized(false);
    setRowData([]);
    setHasChanges(false);
    setAnnualBudgets([]);
  }, []);

  // Auto-fetch annual budgets when config changes
  useEffect(() => {
    if (autoFetch && restaurantId && year && !isInitialized) {
      logger.info('Auto-fetching annual budgets', { restaurantId, year });
      fetchAnnualBudgets(restaurantId, year);
      setIsInitialized(true);
    }
  }, [restaurantId, year, fetchAnnualBudgets, isInitialized, autoFetch]);

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
    } else if (isInitialized && !loading) {
      logger.debug('No annual budgets found, using default structure');
      setRowData(getDefaultBudgetStructure());
    }
  }, [annualBudgets, isInitialized, loading]);

  return {
    // Annual Budgets
    annualBudgets: rowData,
    rowData,
    hasChanges,
    
    // States
    loading,
    error,
    
    // Annual Budget Methods
    fetchAnnualBudgets,
    saveAnnualBudgets,
    handleCellChange,
    
    // Utility Methods
    reloadData
  };
};
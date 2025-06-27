
import { useState, useEffect, useCallback } from 'react';
import { useAnnualBudgets } from '@/hooks/useAnnualBudgets';
import { toast } from 'sonner';
import { BudgetData, BudgetDataHookReturn } from '@/types/budgetTypes';
import { getDefaultBudgetStructure } from '@/constants/defaultBudgetStructure';

export const useBudgetData = (restaurantId: string, year: number): BudgetDataHookReturn => {
  const [rowData, setRowData] = useState<BudgetData[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { budgets, loading, error, fetchBudgets, saveBudgets } = useAnnualBudgets();

  // Cargar datos solo una vez cuando cambien las props
  useEffect(() => {
    if (restaurantId && year && !isInitialized) {
      console.log('useBudgetData - Loading data for:', { restaurantId, year });
      fetchBudgets(restaurantId, year);
      setIsInitialized(true);
    }
  }, [restaurantId, year, fetchBudgets, isInitialized]);

  // Procesar datos cuando cambien los budgets del hook
  useEffect(() => {
    if (budgets.length > 0) {
      console.log('useBudgetData - Processing budgets from DB:', budgets.length);
      // Convertir datos de la BD al formato del grid
      const gridData = budgets.map(budget => ({
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
      console.log('useBudgetData - No budgets found, using default structure');
      setRowData(getDefaultBudgetStructure());
    }
  }, [budgets, isInitialized, loading]);

  // Función optimizada para manejar cambios en las celdas
  const handleCellChange = useCallback((id: string, field: string, value: number) => {
    console.log('useBudgetData - Cell changed:', { id, field, value });
    
    // Lista de campos numéricos editables
    const numericFields = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    if (!numericFields.includes(field)) {
      console.warn('useBudgetData - Field not editable:', field);
      return;
    }
    
    setRowData(prevData => {
      const updatedData = prevData.map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          // Recalcular el total
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

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    
    try {
      console.log('useBudgetData - Saving data:', rowData.length, 'rows');
      const success = await saveBudgets(restaurantId, year, rowData);
      if (success) {
        setHasChanges(false);
        console.log('useBudgetData - Save successful');
      }
    } catch (error) {
      console.error('useBudgetData - Error saving budget:', error);
      toast.error('Error al guardar el presupuesto');
    }
  }, [hasChanges, rowData, restaurantId, year, saveBudgets]);

  const reloadData = useCallback(() => {
    setIsInitialized(false);
    setRowData([]);
    setHasChanges(false);
  }, []);

  return {
    rowData,
    hasChanges,
    loading,
    error,
    handleCellChange,
    handleSave,
    reloadData
  };
};

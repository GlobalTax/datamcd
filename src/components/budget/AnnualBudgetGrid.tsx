
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useBudgetData } from '@/hooks/useBudgetData';
import { useActualData } from '@/hooks/useActualData';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { BudgetTable } from './BudgetTable';
import { BudgetGridHeader } from './BudgetGridHeader';
import { BudgetGridStatus } from './BudgetGridStatus';
import { BudgetChangesBanner } from './BudgetChangesBanner';
import { toast } from 'sonner';

interface AnnualBudgetGridProps {
  restaurantId: string;
  year: number;
}

export const AnnualBudgetGrid: React.FC<AnnualBudgetGridProps> = ({
  restaurantId,
  year
}) => {
  const [viewMode, setViewMode] = useState<'budget' | 'comparison' | 'actuals'>('budget');
  const [showOnlySummary, setShowOnlySummary] = useState(false);
  
  const { restaurants } = useFranchiseeRestaurants();
  
  const {
    rowData,
    hasChanges,
    loading,
    error,
    handleCellChange,
    handleSave,
    reloadData
  } = useBudgetData(restaurantId, year);

  const {
    actualData,
    loading: actualLoading,
    error: actualError,
    fetchActualData,
    updateActualData
  } = useActualData();

  const selectedRestaurant = restaurants.find(r => r.id === restaurantId);
  const restaurantName = selectedRestaurant?.base_restaurant?.restaurant_name;

  // Cargar datos reales automáticamente
  useEffect(() => {
    if (restaurantId && year) {
      fetchActualData(restaurantId, year);
    }
  }, [restaurantId, year, fetchActualData]);

  const handleToggleViewMode = (mode: 'budget' | 'comparison' | 'actuals') => {
    setViewMode(mode);
  };

  const handleToggleSummary = () => {
    setShowOnlySummary(!showOnlySummary);
  };

  // Nueva función para manejar cambios en datos reales
  const handleActualChange = async (rowId: string, field: string, value: number) => {
    try {
      // Buscar la fila correspondiente para obtener categoría y subcategoría
      const row = rowData.find(r => r.id === rowId);
      if (!row) return;

      await updateActualData({
        restaurant_id: restaurantId,
        year,
        category: row.category,
        subcategory: row.subcategory || '',
        [field]: value
      });

      // Recargar datos reales
      fetchActualData(restaurantId, year);
      toast.success('Dato real actualizado correctamente');
    } catch (error) {
      console.error('Error updating actual data:', error);
      toast.error('Error al actualizar el dato real');
    }
  };

  // Mostrar estados de carga o error
  if (loading || error) {
    return (
      <BudgetGridStatus 
        loading={loading}
        error={error}
        onReload={reloadData}
      />
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <BudgetGridHeader
          year={year}
          hasChanges={hasChanges}
          loading={loading}
          budgetData={rowData}
          restaurantName={restaurantName}
          onSave={handleSave}
          viewMode={viewMode}
          onToggleViewMode={handleToggleViewMode}
          showOnlySummary={showOnlySummary}
          onToggleSummary={handleToggleSummary}
        />
        <BudgetChangesBanner hasChanges={hasChanges} />
      </CardHeader>
      <CardContent className="p-0">
        <BudgetTable 
          data={rowData} 
          actualData={actualData}
          onCellChange={handleCellChange}
          onActualChange={handleActualChange}
          viewMode={viewMode}
          showOnlySummary={showOnlySummary}
        />
      </CardContent>
    </Card>
  );
};

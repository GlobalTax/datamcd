
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Eye, EyeOff, BarChart3, TrendingUp } from 'lucide-react';
import { BudgetData } from '@/types/budgetTypes';
import { markInteraction } from '@/lib/monitoring/marks';

interface BudgetGridHeaderProps {
  year: number;
  hasChanges: boolean;
  loading: boolean;
  budgetData: BudgetData[];
  restaurantName?: string;
  onSave: () => void;
  viewMode?: 'budget' | 'comparison' | 'actuals';
  onToggleViewMode?: (mode: 'budget' | 'comparison' | 'actuals') => void;
  showOnlySummary?: boolean;
  onToggleSummary?: () => void;
}

export const BudgetGridHeader: React.FC<BudgetGridHeaderProps> = ({
  year,
  hasChanges,
  loading,
  budgetData,
  restaurantName,
  onSave,
  viewMode = 'budget',
  onToggleViewMode,
  showOnlySummary = false,
  onToggleSummary
}) => {
  const calculateTotal = () => {
    return budgetData.reduce((sum, row) => sum + (row.total || 0), 0);
  };

  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString('es-ES')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Presupuesto Anual {year}
          </h2>
          {restaurantName && (
            <p className="text-sm text-gray-600 mt-1">{restaurantName}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Presupuestado</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(calculateTotal())}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {onToggleViewMode && (
            <>
              <Button
                onClick={() => onToggleViewMode('budget')}
                variant={viewMode === 'budget' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Presupuesto
              </Button>
              <Button
                onClick={() => onToggleViewMode('comparison')}
                variant={viewMode === 'comparison' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Mostrar Comparativa
              </Button>
              <Button
                onClick={() => onToggleViewMode('actuals')}
                variant={viewMode === 'actuals' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Mostrar Reales
              </Button>
            </>
          )}
          {onToggleSummary && (
            <Button
              onClick={onToggleSummary}
              variant="outline"
              className="flex items-center gap-2"
            >
              {showOnlySummary ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showOnlySummary ? 'Mostrar Detalle' : 'Mostrar Resumen'}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-amber-600 font-medium">
              Cambios sin guardar
            </span>
          )}
          <Button 
            onClick={() => { markInteraction('budget:save', { path: location.pathname }); onSave(); }}
            disabled={!hasChanges || loading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

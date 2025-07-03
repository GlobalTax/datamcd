
import React, { useState } from 'react';
import { useValuationBudgets } from '@/hooks/useValuationBudgets';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { BudgetList } from '@/components/budget/BudgetList';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { BudgetDetail } from '@/components/budget/BudgetDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, TrendingUp, Calculator, DollarSign } from 'lucide-react';
import { ValuationBudget } from '@/types/budget';

export default function BudgetValuationPage() {
  const { budgets, loading, createBudget, updateBudget, deleteBudget } = useValuationBudgets();
  const { restaurants, loading: restaurantsLoading } = useFranchiseeRestaurants();
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedBudget, setSelectedBudget] = useState<ValuationBudget | null>(null);

  const handleCreateBudget = () => {
    setCurrentView('create');
    setSelectedBudget(null);
  };

  const handleSelectBudget = (budget: ValuationBudget) => {
    setSelectedBudget(budget);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedBudget(null);
  };

  const handleFormSubmit = async (data: any) => {
    const success = await createBudget(data);
    if (success) {
      setCurrentView('list');
    }
  };

  const totalValuation = budgets.reduce((sum, budget) => sum + (budget.final_valuation || 0), 0);
  const activeBudgets = budgets.filter(budget => budget.status === 'draft' || budget.status === 'approved').length;
  const avgProjectionYears = budgets.length > 0 
    ? budgets.reduce((sum, budget) => sum + budget.years_projection, 0) / budgets.length 
    : 0;

  if (loading || restaurantsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando presupuestos de valoración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            {currentView !== 'list' && (
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calculator className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Presupuestos de Valoración
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Gestión y proyección financiera de restaurantes
                  </p>
                </div>
              </div>
            </div>
            {currentView === 'list' && (
              <Button onClick={handleCreateBudget} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Presupuesto
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards - Solo en vista de lista */}
        {currentView === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valoración Total</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  €{totalValuation.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Suma de todas las valoraciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presupuestos Activos</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{activeBudgets}</div>
                <p className="text-xs text-muted-foreground">
                  En borrador o aprobados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyección Promedio</CardTitle>
                <Calculator className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {avgProjectionYears.toFixed(1)} años
                </div>
                <p className="text-xs text-muted-foreground">
                  Período de proyección
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {currentView === 'list' && (
            <BudgetList
              budgets={budgets}
              onSelectBudget={handleSelectBudget}
              onDeleteBudget={deleteBudget}
            />
          )}

          {currentView === 'create' && (
            <BudgetForm
              restaurants={restaurants}
              onSubmit={handleFormSubmit}
              onCancel={handleBack}
            />
          )}

          {currentView === 'detail' && selectedBudget && (
            <BudgetDetail
              budget={selectedBudget}
              onUpdate={updateBudget}
              onDelete={deleteBudget}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}

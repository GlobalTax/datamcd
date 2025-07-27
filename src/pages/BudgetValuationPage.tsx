
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { useBudgets } from '@/hooks/data/useBudgets';
import { useRestaurants } from '@/hooks/data/useRestaurants';
import { BudgetList } from '@/components/budget/BudgetList';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { BudgetDetail } from '@/components/budget/BudgetDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, TrendingUp, Calculator, DollarSign } from 'lucide-react';
import { ValuationBudget } from '@/types/budget';

export default function BudgetValuationPage() {
  const { valuationBudgets: budgets, loading, createValuationBudget, updateValuationBudget, deleteValuationBudget } = useBudgets({ mode: 'valuation' });
  const { restaurants, loading: restaurantsLoading } = useRestaurants();
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
    const success = await createValuationBudget(data);
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Presupuestos de Valoración</h1>
              <p className="text-sm text-gray-500">Gestión y proyección financiera de restaurantes</p>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Header Controls */}
            <div className="flex justify-between items-center">
              <div></div>
              <div className="flex gap-3">
                {currentView !== 'list' && (
                  <Button 
                    variant="ghost" 
                    onClick={handleBack} 
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                  </Button>
                )}
                {currentView === 'list' && (
                  <Button onClick={handleCreateBudget} className="bg-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Presupuesto
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Cards - Solo en vista de lista */}
            {currentView === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {currentView === 'list' && (
                <BudgetList
                  budgets={budgets}
                  onSelectBudget={handleSelectBudget}
                  onDeleteBudget={deleteValuationBudget}
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
                  onUpdate={updateValuationBudget}
                  onDelete={deleteValuationBudget}
                  onBack={handleBack}
                />
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

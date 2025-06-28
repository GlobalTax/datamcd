
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Download, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { useProfitLossData, useProfitLossCalculations } from '@/hooks/useProfitLossData';
import { ProfitLossTable } from './ProfitLossTable';
import { ProfitLossCharts } from './ProfitLossCharts';
import { ProfitLossForm } from './ProfitLossForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ProfitLossDashboardProps {
  restaurantId: string;
}

const ProfitLossDashboard = ({ restaurantId }: ProfitLossDashboardProps) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');
  const [showOnlyTotals, setShowOnlyTotals] = useState(false);

  const { profitLossData, isLoading, error } = useProfitLossData(restaurantId, selectedYear);
  const { calculateMetrics, formatCurrency, formatPercentage } = useProfitLossCalculations();

  // Generar años disponibles (último 5 años + próximo año)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  // Calcular métricas del año actual
  const yearTotals = profitLossData.reduce((acc, month) => ({
    totalRevenue: acc.totalRevenue + month.total_revenue,
    totalExpenses: acc.totalExpenses + (month.total_cost_of_sales + month.total_labor + month.total_operating_expenses + month.total_mcdonalds_fees),
    operatingIncome: acc.operatingIncome + month.operating_income,
  }), { totalRevenue: 0, totalExpenses: 0, operatingIncome: 0 });

  const yearMetrics = yearTotals.totalRevenue > 0 ? {
    operatingMargin: (yearTotals.operatingIncome / yearTotals.totalRevenue) * 100,
    expenseRatio: (yearTotals.totalExpenses / yearTotals.totalRevenue) * 100,
  } : { operatingMargin: 0, expenseRatio: 0 };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de P&L...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar los datos de P&L</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">P&L Histórico</h1>
          <p className="text-gray-600">Datos de Profit & Loss del restaurante {restaurantId}</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Datos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Datos P&L</DialogTitle>
              </DialogHeader>
              <ProfitLossForm 
                restaurantId={restaurantId}
                onClose={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs del año */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearTotals.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Año {selectedYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearTotals.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{formatPercentage(yearMetrics.expenseRatio)} de ingresos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Operativo</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearTotals.operatingIncome)}</div>
            <p className="text-xs text-muted-foreground">{formatPercentage(yearMetrics.operatingMargin)} margen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros</CardTitle>
            <span className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitLossData.length}</div>
            <p className="text-xs text-muted-foreground">meses registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Toggles de vista */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Tabla
          </Button>
          <Button 
            variant={viewMode === 'charts' ? 'default' : 'outline'}
            onClick={() => setViewMode('charts')}
          >
            Gráficos
          </Button>
          
          {viewMode === 'table' && (
            <Button 
              variant="outline"
              onClick={() => setShowOnlyTotals(!showOnlyTotals)}
              className="flex items-center gap-2"
            >
              {showOnlyTotals ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showOnlyTotals ? 'Mostrar Detalle' : 'Solo Totales'}
            </Button>
          )}
        </div>
        
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Contenido principal */}
      {viewMode === 'table' ? (
        <ProfitLossTable data={profitLossData} showOnlyTotals={showOnlyTotals} />
      ) : (
        <ProfitLossCharts data={profitLossData} />
      )}
    </div>
  );
};

export default ProfitLossDashboard;

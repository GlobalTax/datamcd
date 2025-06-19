
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, TrendingUp, TrendingDown, DollarSign, BarChart3, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { useDataExport } from '@/hooks/useDataExport';
import { DataImportDialog } from '@/components/DataImportDialog';
import { FinancialMetrics } from './FinancialMetrics';
import { PerformanceCharts } from './PerformanceCharts';
import { RestaurantComparison } from './RestaurantComparison';
import { ProfitabilityAnalysis } from './ProfitabilityAnalysis';
import { toast } from 'sonner';

export const AnalysisDashboard = () => {
  const { franchisee } = useAuth();
  const { restaurants } = useFranchiseeRestaurants();
  const { exportRestaurantsData } = useDataExport();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');

  // Generar años disponibles
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

  // Calcular métricas reales de los restaurantes
  const calculateMetrics = () => {
    if (restaurants.length === 0) {
      return {
        totalRevenue: 0,
        operatingMargin: 0,
        averageROI: 0,
        activeRestaurants: 0
      };
    }

    const totalRevenue = restaurants.reduce((sum, restaurant) => 
      sum + (restaurant.last_year_revenue || 0), 0
    );

    const totalRent = restaurants.reduce((sum, restaurant) => 
      sum + (restaurant.monthly_rent || 0) * 12, 0
    );

    const operatingMargin = totalRevenue > 0 ? ((totalRevenue - totalRent) / totalRevenue) * 100 : 0;
    const averageROI = totalRevenue > 0 && totalRent > 0 ? ((totalRevenue - totalRent) / totalRent) * 100 : 0;

    return {
      totalRevenue,
      operatingMargin,
      averageROI,
      activeRestaurants: restaurants.length
    };
  };

  const metrics = calculateMetrics();

  const handleImportComplete = () => {
    window.location.reload();
  };

  const handleExport = () => {
    try {
      exportRestaurantsData(restaurants);
      toast.success('Datos exportados correctamente');
    } catch (error) {
      toast.error('Error al exportar los datos');
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  if (!franchisee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Cargando datos del franquiciado...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero</h1>
          <p className="text-gray-600">
            Análisis integral de rendimiento - {franchisee.franchisee_name}
          </p>
        </div>
        
        <div className="flex gap-3">
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

          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Restaurantes</SelectItem>
              {restaurants.map(restaurant => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.base_restaurant?.restaurant_name || `Restaurante ${restaurant.base_restaurant?.site_number}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DataImportDialog onImportComplete={handleImportComplete} />

          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Summary - Datos Reales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {restaurants.length} restaurantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Operativo</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.operatingMargin)}</div>
            <p className="text-xs text-muted-foreground">
              Estimado vs renta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.averageROI)}</div>
            <p className="text-xs text-muted-foreground">
              Retorno sobre inversión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurantes Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeRestaurants}</div>
            <p className="text-xs text-muted-foreground">
              En operación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Métricas Financieras</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="profitability">Rentabilidad</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <FinancialMetrics 
            selectedYear={selectedYear}
            selectedRestaurant={selectedRestaurant}
            restaurants={restaurants}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceCharts 
            selectedYear={selectedYear}
            selectedRestaurant={selectedRestaurant}
            restaurants={restaurants}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <RestaurantComparison 
            selectedYear={selectedYear}
            restaurants={restaurants}
          />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <ProfitabilityAnalysis 
            selectedYear={selectedYear}
            selectedRestaurant={selectedRestaurant}
            restaurants={restaurants}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

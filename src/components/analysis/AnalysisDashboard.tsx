
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { FinancialMetrics } from './FinancialMetrics';
import { PerformanceCharts } from './PerformanceCharts';
import { RestaurantComparison } from './RestaurantComparison';
import { ProfitabilityAnalysis } from './ProfitabilityAnalysis';

export const AnalysisDashboard = () => {
  const { franchisee } = useAuth();
  const { restaurants } = useFranchiseeRestaurants();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');

  // Generar años disponibles
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

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

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€1,234,567</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.3%</span> vs año anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Operativo</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> vs año anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-1.2%</span> vs año anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurantes Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.length}</div>
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

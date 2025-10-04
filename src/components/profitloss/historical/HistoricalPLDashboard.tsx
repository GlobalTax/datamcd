import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Upload, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { useHistoricalPL } from '@/hooks/useHistoricalPL';
import { HistoricalDataImporter } from '../HistoricalDataImporter';

interface HistoricalPLDashboardProps {
  restaurantId: string;
}

export const HistoricalPLDashboard: React.FC<HistoricalPLDashboardProps> = ({ restaurantId }) => {
  const { historicalData, isLoading } = useHistoricalPL(restaurantId);
  const [showImporter, setShowImporter] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const yearlyData = historicalData?.filter(d => d.period_type === 'annual') || [];
  
  const chartData = yearlyData.map(record => ({
    year: record.year,
    ventas: record.net_sales,
    costosComida: record.food_cost + record.food_employees + record.waste + record.paper_cost,
    manoObra: record.crew_labor + record.management_labor + record.social_security,
    gastosOperativos: record.advertising + record.maintenance + record.utilities,
    margenBruto: record.net_sales - (record.food_cost + record.food_employees + record.waste + record.paper_cost),
  })).reverse();

  const metricsData = yearlyData[0] ? {
    ventasTotales: yearlyData[0].net_sales,
    margenBruto: yearlyData[0].net_sales - (yearlyData[0].food_cost + yearlyData[0].food_employees + yearlyData[0].waste + yearlyData[0].paper_cost),
    costosOperativos: yearlyData[0].crew_labor + yearlyData[0].management_labor + yearlyData[0].advertising + yearlyData[0].maintenance,
    beneficioNeto: yearlyData[0].net_sales - (yearlyData[0].food_cost + yearlyData[0].crew_labor + yearlyData[0].management_labor + yearlyData[0].advertising),
  } : null;

  if (showImporter) {
    return (
      <HistoricalDataImporter
        restaurantId={restaurantId}
        onClose={() => setShowImporter(false)}
      />
    );
  }

  if (!yearlyData.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <PieChart className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hay datos históricos</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Comienza importando datos históricos de P&L para ver análisis y tendencias
          </p>
          <Button onClick={() => setShowImporter(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Importar Datos
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Datos Históricos P&L</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImporter(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Importar Más Datos
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {metricsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ventas Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                <span className="text-2xl font-bold">
                  €{(metricsData.ventasTotales / 1000).toFixed(0)}k
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Margen Bruto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 text-blue-500" />
                <span className="text-2xl font-bold">
                  €{(metricsData.margenBruto / 1000).toFixed(0)}k
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Costos Operativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                €{(metricsData.costosOperativos / 1000).toFixed(0)}k
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Beneficio Neto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-green-600">
                €{(metricsData.beneficioNeto / 1000).toFixed(0)}k
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="costs">Costos</TabsTrigger>
          <TabsTrigger value="margins">Márgenes</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `€${(value / 1000).toFixed(0)}k`} />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={2} name="Ventas Netas" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desglose de Costos por Año</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `€${(value / 1000).toFixed(0)}k`} />
                  <Legend />
                  <Bar dataKey="costosComida" fill="#ef4444" name="Costos de Comida" />
                  <Bar dataKey="manoObra" fill="#f59e0b" name="Mano de Obra" />
                  <Bar dataKey="gastosOperativos" fill="#3b82f6" name="Gastos Operativos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución del Margen Bruto</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `€${(value / 1000).toFixed(0)}k`} />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={2} name="Ventas" />
                  <Line type="monotone" dataKey="margenBruto" stroke="#3b82f6" strokeWidth={2} name="Margen Bruto" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparación Año a Año</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `€${(value / 1000).toFixed(0)}k`} />
                  <Legend />
                  <Bar dataKey="ventas" fill="#10b981" name="Ventas" />
                  <Bar dataKey="margenBruto" fill="#3b82f6" name="Margen Bruto" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

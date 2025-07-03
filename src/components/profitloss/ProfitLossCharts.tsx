
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfitLossData } from '@/types/profitLoss';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useProfitLossCalculations } from '@/hooks/useProfitLossData';

interface ProfitLossChartsProps {
  data: ProfitLossData[];
}

export const ProfitLossCharts = ({ data }: ProfitLossChartsProps) => {
  const { formatCurrency } = useProfitLossCalculations();

  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  // Preparar datos para los gráficos
  const chartData = data
    .sort((a, b) => a.month - b.month)
    .map(item => ({
      month: monthNames[item.month - 1],
      ingresos: item.total_revenue,
      gastos: item.total_cost_of_sales + item.total_labor + item.total_operating_expenses + item.total_mcdonalds_fees,
      beneficio: item.operating_income,
      margen: item.total_revenue > 0 ? (item.operating_income / item.total_revenue) * 100 : 0,
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">No hay datos disponibles para mostrar gráficos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de línea: Ingresos vs Beneficio */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución Mensual - Ingresos vs Beneficio</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ingresos" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Ingresos" 
              />
              <Line 
                type="monotone" 
                dataKey="beneficio" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Beneficio Operativo" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de barras: Ingresos vs Gastos */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativa Mensual - Ingresos vs Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
              <Bar dataKey="gastos" fill="#ef4444" name="Gastos Totales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de línea: Margen Operativo */}
      <Card>
        <CardHeader>
          <CardTitle>Margen Operativo Mensual (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Line 
                type="monotone" 
                dataKey="margen" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Margen Operativo %" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRestaurantFinancials } from '@/hooks/useRestaurantFinancials';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { Euro, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface RestaurantFinanceTabProps {
  restaurantId: string;
}

export const RestaurantFinanceTab: React.FC<RestaurantFinanceTabProps> = ({ restaurantId }) => {
  const { financials, budgets, loading } = useRestaurantFinancials(restaurantId);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financials.totalRevenue ? formatCurrency(financials.totalRevenue) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Este año</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financials.totalExpenses ? formatCurrency(financials.totalExpenses) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Este año</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
            {financials.netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financials.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financials.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Este año</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financials.profitMargin ? `${financials.profitMargin.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">De beneficio</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financials.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget vs Actual */}
        <Card>
          <CardHeader>
            <CardTitle>Presupuesto vs Real</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgets.comparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="budget" fill="hsl(var(--muted))" name="Presupuesto" />
                <Bar dataKey="actual" fill="hsl(var(--primary))" name="Real" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Financial Table */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose Financiero Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Mes</th>
                  <th className="text-right py-2">Ingresos</th>
                  <th className="text-right py-2">Gastos</th>
                  <th className="text-right py-2">Beneficio</th>
                  <th className="text-right py-2">Margen</th>
                </tr>
              </thead>
              <tbody>
                {financials.monthlyData.map((month, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 font-medium">{month.month}</td>
                    <td className="text-right py-2">{formatCurrency(month.revenue)}</td>
                    <td className="text-right py-2">{formatCurrency(month.expenses)}</td>
                    <td className={`text-right py-2 ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(month.profit)}
                    </td>
                    <td className="text-right py-2">{month.margin.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
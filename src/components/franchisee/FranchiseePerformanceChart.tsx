import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

interface FranchiseePerformanceChartProps {
  restaurants: FranchiseeRestaurant[];
  franchiseeName: string;
}

export function FranchiseePerformanceChart({ restaurants, franchiseeName }: FranchiseePerformanceChartProps) {
  // Preparar datos para el gráfico de barras por restaurante
  const restaurantData = restaurants.map((restaurant, index) => ({
    name: restaurant.base_restaurant?.restaurant_name || `Restaurante ${index + 1}`,
    siteNumber: restaurant.base_restaurant?.site_number || '',
    monthlyRevenue: restaurant.average_monthly_sales || 0,
    yearlyRevenue: restaurant.last_year_revenue || 0,
    monthlyRent: restaurant.monthly_rent || 0,
    estimatedMargin: (restaurant.average_monthly_sales || 0) - (restaurant.monthly_rent || 0) - ((restaurant.average_monthly_sales || 0) * 0.08),
  })).sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

  // Datos simulados de tendencia mensual (en una implementación real vendrían de la API)
  const monthlyTrend = [
    { month: 'Ene', revenue: 85000, target: 80000 },
    { month: 'Feb', revenue: 87000, target: 82000 },
    { month: 'Mar', revenue: 92000, target: 85000 },
    { month: 'Abr', revenue: 89000, target: 87000 },
    { month: 'May', revenue: 94000, target: 90000 },
    { month: 'Jun', revenue: 96000, target: 92000 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Performance por Restaurante */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance por Restaurante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={restaurantData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="siteNumber" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(label) => `Site: ${label}`}
              />
              <Bar dataKey="monthlyRevenue" fill="#3b82f6" name="Revenue Mensual" radius={[4, 4, 0, 0]} />
              <Bar dataKey="estimatedMargin" fill="#10b981" name="Margen Estimado" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Tendencia Mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Tendencia Mensual Consolidada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis 
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Revenue Real"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#6b7280" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Objetivo"
                dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
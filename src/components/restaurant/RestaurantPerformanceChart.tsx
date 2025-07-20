
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface RestaurantPerformanceChartProps {
  restaurants: any[];
}

export const RestaurantPerformanceChart: React.FC<RestaurantPerformanceChartProps> = ({ restaurants }) => {
  // Preparar datos para el gráfico de barras
  const barChartData = restaurants
    .filter(r => r.last_year_revenue)
    .slice(0, 8) // Mostrar solo los primeros 8 para mejor visualización
    .map(restaurant => ({
      name: restaurant.base_restaurant?.restaurant_name?.split(' ').slice(-2).join(' ') || 
             `Site ${restaurant.base_restaurant?.site_number}` || 
             'Restaurante',
      revenue: restaurant.last_year_revenue,
      rent: (restaurant.monthly_rent || 0) * 12,
      margin: restaurant.last_year_revenue - ((restaurant.monthly_rent || 0) * 12)
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Preparar datos para el gráfico de pastel (distribución por ciudad)
  const cityDistribution = restaurants.reduce((acc: any, restaurant) => {
    const city = restaurant.base_restaurant?.city || 'Sin especificar';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.entries(cityDistribution)
    .map(([city, count]) => ({ name: city, value: count }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 6); // Top 6 ciudades

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'revenue' && 'Facturación: '}
              {entry.dataKey === 'rent' && 'Renta Anual: '}
              {entry.dataKey === 'margin' && 'Margen: '}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gráfico de barras - Rendimiento financiero */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Rendimiento Financiero por Restaurante
          </CardTitle>
        </CardHeader>
        <CardContent>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  fontSize={12}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#0088FE" name="Facturación" radius={[2, 2, 0, 0]} />
                <Bar dataKey="rent" fill="#FF8042" name="Renta Anual" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay datos suficientes para mostrar el gráfico</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de pastel - Distribución por ciudad */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Distribución por Ciudad
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  fontSize={11}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 bg-muted rounded-full"></div>
                <p className="text-sm">Sin datos</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

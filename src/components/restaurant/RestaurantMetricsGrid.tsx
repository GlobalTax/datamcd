
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Euro, TrendingUp, AlertTriangle } from 'lucide-react';

interface RestaurantMetricsGridProps {
  restaurants: any[];
}

export const RestaurantMetricsGrid: React.FC<RestaurantMetricsGridProps> = ({ restaurants }) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calcular métricas
  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.status === 'active').length;
  
  const totalRevenueLastYear = restaurants.reduce((sum, restaurant) => {
    return sum + (restaurant.last_year_revenue || 0);
  }, 0);
  
  const totalMonthlyRent = restaurants.reduce((sum, restaurant) => {
    return sum + (restaurant.monthly_rent || 0);
  }, 0);
  
  const averageRevenue = totalRestaurants > 0 ? totalRevenueLastYear / totalRestaurants : 0;
  
  // Calcular alertas (contratos que vencen pronto, etc.)
  const alertCount = restaurants.filter(restaurant => {
    const franchiseEndDate = restaurant.franchise_end_date;
    if (!franchiseEndDate) return false;
    
    const endDate = new Date(franchiseEndDate);
    const now = new Date();
    const monthsUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    return monthsUntilExpiry <= 12; // Alerta si vence en menos de 12 meses
  }).length;

  const metrics = [
    {
      title: 'Total Restaurantes',
      value: totalRestaurants.toString(),
      subtitle: `${activeRestaurants} activos`,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Facturación Total',
      value: formatCurrency(totalRevenueLastYear),
      subtitle: `Promedio: ${formatCurrency(averageRevenue)}`,
      icon: Euro,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Renta Mensual Total',
      value: formatCurrency(totalMonthlyRent),
      subtitle: `${formatCurrency(totalMonthlyRent * 12)} anual`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Alertas Activas',
      value: alertCount.toString(),
      subtitle: alertCount > 0 ? 'Requieren atención' : 'Todo en orden',
      icon: AlertTriangle,
      color: alertCount > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: alertCount > 0 ? 'bg-red-50' : 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.subtitle}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

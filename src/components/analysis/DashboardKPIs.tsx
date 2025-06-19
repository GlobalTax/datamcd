
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

interface DashboardKPIsProps {
  restaurants: any[];
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ restaurants }) => {
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

  return (
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
  );
};

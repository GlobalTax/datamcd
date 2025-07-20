
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

interface RestaurantMetricsProps {
  restaurants: FranchiseeRestaurant[];
  canViewAllRestaurants: boolean;
}

const RestaurantMetrics: React.FC<RestaurantMetricsProps> = ({
  restaurants,
  canViewAllRestaurants
}) => {
  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.status === 'active').length;
  const inactiveRestaurants = totalRestaurants - activeRestaurants;
  
  const uniqueFranchisees = new Set(
    restaurants
      .map(r => (r as any).franchisee_display_name)
      .filter(name => name && name !== 'Sin asignar')
  ).size;

  const totalRevenue = restaurants.reduce((sum, r) => {
    return sum + (r.last_year_revenue || 0);
  }, 0);

  const averageRevenue = totalRestaurants > 0 ? totalRevenue / totalRestaurants : 0;

  const restaurantsNeedingAttention = restaurants.filter(r => 
    r.status !== 'active' || 
    !r.monthly_rent || 
    !r.last_year_revenue ||
    !r.base_restaurant?.city
  ).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
      notation: value > 1000000 ? 'compact' : 'standard'
    }).format(value);
  };

  const metrics = [
    {
      title: 'Total Restaurantes',
      value: totalRestaurants.toLocaleString(),
      icon: Building2,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'Restaurantes Activos',
      value: activeRestaurants.toLocaleString(),
      subtitle: `${inactiveRestaurants} inactivos`,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-700 border-green-200'
    }
  ];

  if (canViewAllRestaurants) {
    metrics.push({
      title: 'Franquiciados',
      value: uniqueFranchisees.toLocaleString(),
      icon: Users,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    });
  }

  metrics.push({
    title: 'Ingresos Promedio',
    value: formatCurrency(averageRevenue),
    subtitle: `Total: ${formatCurrency(totalRevenue)}`,
    icon: TrendingUp,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  });

  if (restaurantsNeedingAttention > 0) {
    metrics.push({
      title: 'Requieren Atención',
      value: restaurantsNeedingAttention.toLocaleString(),
      subtitle: 'Datos incompletos',
      icon: AlertTriangle,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </p>
                {metric.subtitle && (
                  <p className="text-xs text-gray-500">
                    {metric.subtitle}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={`p-2 ${metric.color}`}>
                <Icon className="h-4 w-4" />
              </Badge>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default RestaurantMetrics;

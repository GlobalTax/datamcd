import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRestaurantKPIs } from '@/hooks/useRestaurantKPIs';
import { 
  Euro, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Clock,
  Target
} from 'lucide-react';

interface RestaurantKPICardsProps {
  restaurantId: string;
}

export const RestaurantKPICards: React.FC<RestaurantKPICardsProps> = ({ restaurantId }) => {
  const { kpis, loading } = useRestaurantKPIs(restaurantId);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue KPI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Facturación Mensual</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis.monthlyRevenue ? formatCurrency(kpis.monthlyRevenue) : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {kpis.revenueGrowth !== null && (
              <span className={kpis.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {kpis.revenueGrowth >= 0 ? '+' : ''}{formatPercentage(kpis.revenueGrowth)} vs mes anterior
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Incidents KPI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Incidencias Activas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.activeIncidents}</div>
          <div className="flex gap-2 mt-2">
            {kpis.criticalIncidents > 0 && (
              <Badge variant="destructive" className="text-xs">
                {kpis.criticalIncidents} críticas
              </Badge>
            )}
            {kpis.pendingIncidents > 0 && (
              <Badge variant="secondary" className="text-xs">
                {kpis.pendingIncidents} pendientes
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personnel KPI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.activeEmployees}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.totalEmployees} empleados totales
          </p>
        </CardContent>
      </Card>

      {/* Performance KPI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rendimiento General</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis.performanceScore ? `${kpis.performanceScore.toFixed(0)}%` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {kpis.performanceScore && (
              <span className={kpis.performanceScore >= 80 ? 'text-green-600' : kpis.performanceScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                {kpis.performanceScore >= 80 ? 'Excelente' : kpis.performanceScore >= 60 ? 'Bueno' : 'Necesita mejora'}
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
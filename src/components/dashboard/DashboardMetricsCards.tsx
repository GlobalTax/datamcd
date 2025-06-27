
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingUp, BarChart3 } from 'lucide-react';

interface DashboardMetricsCardsProps {
  metrics: {
    totalRestaurants: number;
    totalRevenue: number;
    operatingMargin: number;
    averageROI: number;
  };
  formatCurrency: (value: number) => string;
  connectionStatus: 'connecting' | 'connected' | 'fallback';
}

export const DashboardMetricsCards: React.FC<DashboardMetricsCardsProps> = ({
  metrics,
  formatCurrency,
  connectionStatus
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Restaurantes</CardTitle>
          <Building className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalRestaurants}</div>
          <p className="text-xs text-muted-foreground">
            {connectionStatus === 'connected' ? 'Desde Supabase' : 'Datos temporales'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">Último año</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margen Operativo</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.operatingMargin.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Estimado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ROI Promedio</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageROI.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Retorno anual</p>
        </CardContent>
      </Card>
    </div>
  );
};

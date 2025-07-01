
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, AlertTriangle } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  status: string;
  lastYearRevenue?: number;
}

interface DashboardSummaryProps {
  totalRestaurants: number;
  displayRestaurants: Restaurant[];
  isTemporaryData: boolean;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  totalRestaurants,
  displayRestaurants,
  isTemporaryData
}) => {
  const activeRestaurants = displayRestaurants.filter(r => r.status === 'active').length;
  const totalRevenue = displayRestaurants.reduce((sum, r) => sum + (r.lastYearRevenue || 0), 0);

  return (
    <div data-testid="dashboard-summary" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {isTemporaryData && (
        <div className="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Trabajando con datos temporales</span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Restaurantes Totales</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRestaurants}</div>
          <p className="text-xs text-muted-foreground">
            {activeRestaurants} activos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            €{totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Año anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado</CardTitle>
          <Badge variant={isTemporaryData ? 'secondary' : 'default'}>
            {isTemporaryData ? 'Temporal' : 'En vivo'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((activeRestaurants / totalRestaurants) * 100) || 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            Restaurantes activos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

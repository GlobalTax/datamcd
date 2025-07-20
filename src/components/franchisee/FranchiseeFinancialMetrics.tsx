import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

interface FranchiseeFinancialMetricsProps {
  restaurants: FranchiseeRestaurant[];
  franchiseeName: string;
}

export function FranchiseeFinancialMetrics({ restaurants, franchiseeName }: FranchiseeFinancialMetricsProps) {
  // Calcular métricas consolidadas
  const totalRestaurants = restaurants.length;
  const totalMonthlyRevenue = restaurants.reduce((sum, r) => sum + (r.average_monthly_sales || 0), 0);
  const totalLastYearRevenue = restaurants.reduce((sum, r) => sum + (r.last_year_revenue || 0), 0);
  const totalMonthlyRent = restaurants.reduce((sum, r) => sum + (r.monthly_rent || 0), 0);
  
  // Calcular promedios
  const avgRevenuePerRestaurant = totalRestaurants > 0 ? totalMonthlyRevenue / totalRestaurants : 0;
  const avgRentPerRestaurant = totalRestaurants > 0 ? totalMonthlyRent / totalRestaurants : 0;
  
  // Estimación de fees McDonald's (promedio 8% del revenue)
  const estimatedMonthlyFees = totalMonthlyRevenue * 0.08;
  
  // Estimación de margen operativo (aproximado después de costes principales)
  const estimatedOperatingMargin = totalMonthlyRevenue - totalMonthlyRent - estimatedMonthlyFees;
  const marginPercentage = totalMonthlyRevenue > 0 ? (estimatedOperatingMargin / totalMonthlyRevenue) * 100 : 0;

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Función para obtener icono de tendencia
  const getTrendIcon = (percentage: number) => {
    if (percentage > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (percentage < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  // Función para obtener color de badge según el margen
  const getMarginBadgeVariant = (margin: number) => {
    if (margin > 20) return "default"; // Verde
    if (margin > 10) return "secondary"; // Amarillo
    return "destructive"; // Rojo
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Métricas Financieras Consolidadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Total Mensual */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-600">Revenue Mensual Total</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalMonthlyRevenue)}</p>
                <p className="text-xs text-blue-700 mt-1">
                  Promedio por restaurante: {formatCurrency(avgRevenuePerRestaurant)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Margen Operativo Estimado */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-600">Margen Operativo Est.</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(estimatedOperatingMargin)}</p>
                <div className="flex items-center mt-1">
                  <Badge variant={getMarginBadgeVariant(marginPercentage)} className="text-xs">
                    {marginPercentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              {getTrendIcon(marginPercentage)}
            </div>
          </div>

          {/* Costes Fijos Totales */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-orange-600">Costes Fijos Totales</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalMonthlyRent + estimatedMonthlyFees)}</p>
                <p className="text-xs text-orange-700 mt-1">
                  Alquiler: {formatCurrency(totalMonthlyRent)} | Fees: {formatCurrency(estimatedMonthlyFees)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          {/* Performance Anual */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-purple-600">Revenue Año Pasado</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalLastYearRevenue)}</p>
                <p className="text-xs text-purple-700 mt-1">
                  {totalRestaurants} restaurante{totalRestaurants !== 1 ? 's' : ''}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Resumen adicional */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-gray-900">Revenue Promedio/Restaurante</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(avgRevenuePerRestaurant)}</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">Alquiler Promedio/Restaurante</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(avgRentPerRestaurant)}</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">Ratio Alquiler/Revenue</p>
              <p className="text-lg font-bold text-purple-600">
                {totalMonthlyRevenue > 0 ? ((totalMonthlyRent / totalMonthlyRevenue) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
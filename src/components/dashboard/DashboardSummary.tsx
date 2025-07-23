
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, TrendingUp, DollarSign, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardSummaryProps {
  totalRestaurants: number;
  displayRestaurants: any[];
  isTemporaryData?: boolean;
}

export const DashboardSummary = ({ 
  totalRestaurants, 
  displayRestaurants, 
  isTemporaryData = false 
}: DashboardSummaryProps) => {
  console.log('DashboardSummary - Props:', {
    totalRestaurants,
    restaurantsCount: displayRestaurants?.length || 0,
    isTemporaryData
  });

  // Verificación exhaustiva de datos
  const safeRestaurants = Array.isArray(displayRestaurants) ? displayRestaurants.filter(r => r && typeof r === 'object') : [];
  const safeTotalRestaurants = typeof totalRestaurants === 'number' ? totalRestaurants : 0;
  
  // Calcular métricas con verificaciones adicionales
  const activeRestaurants = safeRestaurants.filter(r => {
    try {
      return r?.status === 'active' || !r?.status;
    } catch (error) {
      console.warn('DashboardSummary - Error filtering restaurant:', error);
      return false;
    }
  }).length;
  
  const totalRevenue = safeRestaurants.reduce((sum, r) => {
    try {
      const revenue = r?.lastYearRevenue;
      if (typeof revenue === 'number' && !isNaN(revenue)) {
        return sum + revenue;
      }
      return sum;
    } catch (error) {
      console.warn('DashboardSummary - Error calculating revenue:', error);
      return sum;
    }
  }, 0);
  
  const avgRevenue = safeTotalRestaurants > 0 ? totalRevenue / safeTotalRestaurants : 0;

  const handleRefresh = () => {
    console.log('DashboardSummary - Refreshing page');
    try {
      window.location.reload();
    } catch (error) {
      console.error('DashboardSummary - Error refreshing page:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de advertencia para datos temporales */}
      {isTemporaryData && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">Trabajando con datos temporales</h3>
                <p className="text-sm text-orange-800">
                  No se pudo conectar con la base de datos. Los datos mostrados son temporales.
                </p>
              </div>
              <Button 
                onClick={handleRefresh}
                variant="outline" 
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reconectar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurantes Totales</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeTotalRestaurants}</div>
            <p className="text-xs text-muted-foreground">
              {activeRestaurants} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Promedio por Restaurante</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{Math.round(avgRevenue).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isTemporaryData ? 'text-orange-600' : 'text-green-600'}`}>
              {isTemporaryData ? 'Temporal' : 'Activo'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isTemporaryData ? 'Datos sin conexión' : 'Todos los sistemas operativos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de restaurantes */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Restaurantes</CardTitle>
        </CardHeader>
        <CardContent>
          {safeTotalRestaurants === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay restaurantes asignados</p>
              <p className="text-sm">
                {isTemporaryData 
                  ? 'Reconecta para ver tus restaurantes reales' 
                  : 'Contacta con tu asesor para más información'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeRestaurants.map((restaurant, index) => {
                // Verificación exhaustiva de cada restaurant
                if (!restaurant || typeof restaurant !== 'object') {
                  console.warn('DashboardSummary - Invalid restaurant at index:', index);
                  return null;
                }

                const restaurantId = restaurant.id || `restaurant-${index}-${Date.now()}`;
                const restaurantName = restaurant.name || restaurant.restaurant_name || `Restaurante ${restaurant.siteNumber || restaurant.site_number || index + 1}`;
                const location = restaurant.location || `${restaurant.city || 'Ciudad'}, ${restaurant.address || 'Dirección'}`;
                const siteNumber = restaurant.siteNumber || restaurant.site_number || 'N/A';
                const revenue = typeof restaurant.lastYearRevenue === 'number' ? restaurant.lastYearRevenue : 0;
                const status = restaurant.status || 'active';

                return (
                  <div key={restaurantId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{restaurantName}</h3>
                      <p className="text-sm text-muted-foreground">{location}</p>
                      <p className="text-xs text-muted-foreground">Site: {siteNumber}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        €{revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Año anterior</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {status === 'active' ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

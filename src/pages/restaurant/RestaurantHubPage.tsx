import React from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingUp, BarChart3, Users } from 'lucide-react';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';

/**
 * Página principal (hub) para un restaurante específico
 * Muestra el dashboard centrado en ese restaurante
 */
const RestaurantHubPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { restaurant, loading, error } = useRestaurantData(restaurantId!);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del restaurante...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <ImpersonationBanner />
            <div className="flex-1 flex items-center justify-center">
              <Card className="max-w-md">
                <CardContent className="text-center py-12">
                  <Building className="w-16 h-16 mx-auto mb-4 text-red-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Restaurante no encontrado
                  </h3>
                  <p className="text-gray-600">
                    No se pudo cargar la información de este restaurante.
                  </p>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  // Datos simulados para el dashboard
  const metrics = {
    totalRevenue: 450000,
    operatingMargin: 18.5,
    averageROI: 24.2,
    employeeCount: 25
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <ImpersonationBanner />
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {restaurant.base_restaurant?.restaurant_name || 'Restaurante'}
              </h1>
              <p className="text-sm text-gray-500">
                #{restaurant.base_restaurant?.site_number} • {restaurant.base_restaurant?.city}
              </p>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Anuales</CardTitle>
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
                    <div className="text-2xl font-bold">{metrics.operatingMargin}%</div>
                    <p className="text-xs text-muted-foreground">Objetivo: 20%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ROI</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.averageROI}%</div>
                    <p className="text-xs text-muted-foreground">Retorno anual</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Empleados</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.employeeCount}</div>
                    <p className="text-xs text-muted-foreground">Personal activo</p>
                  </CardContent>
                </Card>
              </div>

              {/* Información del restaurante */}
              <Card>
                <CardHeader>
                  <CardTitle>Información del Restaurante</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Dirección</h3>
                      <p className="text-sm text-gray-900">{restaurant.base_restaurant?.address}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Tipo</h3>
                      <p className="text-sm text-gray-900 capitalize">
                        {restaurant.base_restaurant?.restaurant_type || 'Tradicional'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de Apertura</h3>
                      <p className="text-sm text-gray-900">
                        {restaurant.base_restaurant?.opening_date 
                          ? new Date(restaurant.base_restaurant.opening_date).toLocaleDateString('es-ES')
                          : 'No disponible'
                        }
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Capacidad</h3>
                      <p className="text-sm text-gray-900">
                        {restaurant.base_restaurant?.seating_capacity 
                          ? `${restaurant.base_restaurant.seating_capacity} personas`
                          : 'No disponible'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accesos rápidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Accesos Rápidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <Users className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="text-sm font-medium">Personal</div>
                      <div className="text-xs text-gray-500">Gestionar empleados</div>
                    </button>
                    <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
                      <div className="text-sm font-medium">Presupuestos</div>
                      <div className="text-xs text-gray-500">Planificación anual</div>
                    </button>
                    <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                      <div className="text-sm font-medium">P&L</div>
                      <div className="text-xs text-gray-500">Estados financieros</div>
                    </button>
                    <button className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <Building className="w-6 h-6 text-orange-600 mb-2" />
                      <div className="text-sm font-medium">Incidencias</div>
                      <div className="text-xs text-gray-500">Mantenimiento</div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RestaurantHubPage;
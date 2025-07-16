import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Building, TrendingUp, BarChart3, MapPin, Calendar, Users, DollarSign } from 'lucide-react';

const NewDashboardPage = () => {
  const { 
    user, 
    franchisee, 
    restaurants, 
    loading, 
    connectionStatus,
    isImpersonating,
    effectiveFranchisee,
    getDebugInfo
  } = useUnifiedAuth();
  const navigate = useNavigate();

  const debugInfo = getDebugInfo();
  console.log('NEW DASHBOARD DEBUG:', debugInfo);

  // Determinar si es asesor
  const isAdvisor = user?.role && ['asesor', 'admin', 'superadmin', 'advisor'].includes(user.role);

  // Calcular métricas generales
  const totalRestaurants = restaurants.length;
  const totalRevenue = restaurants.reduce((sum, r) => sum + (r.last_year_revenue || 0), 0);
  const averageRevenue = totalRestaurants > 0 ? totalRevenue / totalRestaurants : 0;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando restaurantes...</p>
        </div>
      </div>
    );
  }

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
                {isAdvisor ? 'Panel de Asesor' : 'Dashboard Principal'}
              </h1>
              <p className="text-sm text-gray-500">
                {isAdvisor ? 
                  `Vista completa de todos los restaurantes (${totalRestaurants} restaurantes)` :
                  (effectiveFranchisee?.franchisee_name || 'Panel de Control')
                }
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Métricas generales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Restaurantes</CardTitle>
                    <Building className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalRestaurants}</div>
                    <p className="text-xs text-muted-foreground">En operación</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">Último año</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio por Restaurante</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(averageRevenue)}</div>
                    <p className="text-xs text-muted-foreground">Media anual</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Activos</CardTitle>
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {restaurants.filter(r => r.status === 'active').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Operando</p>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de restaurantes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Mis Restaurantes</h2>
                  <p className="text-sm text-gray-500">
                    Selecciona un restaurante para ver su panel completo
                  </p>
                </div>

                {restaurants.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Building className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay restaurantes asignados
                      </h3>
                      <p className="text-gray-500 text-center max-w-md">
                        Contacta con tu asesor para que te asigne restaurantes o verifica tu configuración.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((restaurant) => (
                      <Card 
                        key={restaurant.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {restaurant.base_restaurant?.restaurant_name || 'Restaurante'}
                            </CardTitle>
                            <Badge className={getStatusColor(restaurant.status || 'active')}>
                              {restaurant.status === 'active' ? 'Activo' : 
                               restaurant.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>
                              {restaurant.base_restaurant?.city || 'Ciudad'}, {restaurant.base_restaurant?.address || 'Dirección'}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Código: {restaurant.base_restaurant?.site_number || 'N/A'}</span>
                          </div>

                          {restaurant.last_year_revenue && (
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>Ingresos: {formatCurrency(restaurant.last_year_revenue)}</span>
                            </div>
                          )}

                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Tipo: {restaurant.base_restaurant?.restaurant_type || 'Tradicional'}</span>
                              <span>Apertura: {restaurant.base_restaurant?.opening_date || 'N/A'}</span>
                            </div>
                          </div>

                          <Button 
                            className="w-full mt-3" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/restaurant/${restaurant.id}`);
                            }}
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Ver Panel Completo
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default NewDashboardPage;

import React from 'react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useNavigate } from 'react-router-dom';
import { useImpersonation } from '@/hooks/useImpersonation';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, BarChart3, Building, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DisplayRestaurant = {
  id: string;
  name?: string;
  restaurant_name?: string;
  location?: string;
  city?: string;
  address?: string;
  siteNumber?: string;
  site_number?: string;
  franchiseeName?: string;
  opening_date?: string;
  contractEndDate?: string;
  restaurant_type?: string;
  status?: string;
  lastYearRevenue?: number;
  baseRent?: number;
  isOwnedByMcD?: boolean;
  currentValuation?: any;
};

const DashboardPage = () => {
  const { user, franchisee, restaurants, loading, isUsingCache } = useFastAuth();
  const navigate = useNavigate();
  const { getEffectiveFranchisee, isImpersonating } = useImpersonation();

  // Obtener el franquiciado efectivo (impersonado o real)
  const effectiveFranchisee = getEffectiveFranchisee(franchisee);

  console.log('DashboardPage - Fast loading state:', {
    user: user ? { id: user.id, role: user.role } : null,
    franchisee: franchisee ? { id: franchisee.id, name: franchisee.franchisee_name } : null,
    restaurantsCount: restaurants?.length || 0,
    loading,
    isUsingCache
  });

  // Transformar datos para el componente
  const displayRestaurants: DisplayRestaurant[] = restaurants.map(r => ({
    id: r.id || `restaurant-${Math.random()}`,
    name: r.base_restaurant?.restaurant_name || 'Restaurante',
    restaurant_name: r.base_restaurant?.restaurant_name || 'Restaurante',
    location: r.base_restaurant ? 
      `${r.base_restaurant.city || 'Ciudad'}, ${r.base_restaurant.address || 'Dirección'}` : 
      'Ubicación',
    city: r.base_restaurant?.city || 'Ciudad',
    address: r.base_restaurant?.address || 'Dirección',
    siteNumber: r.base_restaurant?.site_number || 'N/A',
    site_number: r.base_restaurant?.site_number || 'N/A',
    franchiseeName: effectiveFranchisee?.franchisee_name || 'Franquiciado',
    franchise_start_date: r.franchise_start_date,
    franchise_end_date: r.franchise_end_date,
    restaurant_type: r.base_restaurant?.restaurant_type || 'traditional',
    status: r.status || 'active',
    lastYearRevenue: typeof r.last_year_revenue === 'number' ? r.last_year_revenue : 0,
    baseRent: typeof r.monthly_rent === 'number' ? r.monthly_rent : 0,
    isOwnedByMcD: false,
  }));

  // Calcular métricas del dashboard
  const calculateDashboardMetrics = () => {
    const totalRevenue = displayRestaurants.reduce((sum, r) => sum + (r.lastYearRevenue || 0), 0);
    const totalRent = displayRestaurants.reduce((sum, r) => sum + (r.baseRent || 0) * 12, 0);
    const operatingMargin = totalRevenue > 0 ? ((totalRevenue - totalRent) / totalRevenue) * 100 : 0;
    const averageROI = totalRevenue > 0 && totalRent > 0 ? ((totalRevenue - totalRent) / totalRent) * 100 : 0;

    return {
      totalRevenue,
      operatingMargin,
      averageROI,
      totalRestaurants: displayRestaurants.length
    };
  };

  const metrics = calculateDashboardMetrics();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Loading rápido - máximo 1 segundo
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard rápido...</p>
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
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
                {isUsingCache ? (
                  <div className="flex items-center gap-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs">
                    <WifiOff className="w-3 h-3" />
                    <span>Modo offline</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">
                    <Wifi className="w-3 h-3" />
                    <span>En línea</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {isUsingCache ? 'Datos predefinidos - Carga rápida' : 'Datos actualizados'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/analysis')} 
                variant="default" 
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Análisis
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Restaurantes</CardTitle>
                    <Building className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalRestaurants}</div>
                    <p className="text-xs text-muted-foreground">En operación</p>
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

              {/* Dashboard principal */}
              <DashboardSummary 
                totalRestaurants={metrics.totalRestaurants} 
                displayRestaurants={displayRestaurants}
                isTemporaryData={isUsingCache}
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;

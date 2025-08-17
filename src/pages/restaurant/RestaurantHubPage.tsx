import React from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { useRestaurantRoutes } from '@/hooks/useRestaurantRoutes';
import { useRestaurantHubKPIs } from '@/hooks/useRestaurantHubKPIs';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  TrendingUp, 
  BarChart3, 
  Users, 
  CreditCard,
  AlertTriangle,
  Settings,
  FileText,
  DollarSign,
  Clock
} from 'lucide-react';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { HubCard } from '@/components/restaurant/HubCard';
import { HubKPIValue } from '@/components/restaurant/HubKPIValue';
import { HubStatusIndicator } from '@/components/restaurant/HubStatusIndicator';
import { HubGrid } from '@/components/restaurant/HubGrid';

/**
 * Página principal (hub) para un restaurante específico
 * Muestra el dashboard centrado en ese restaurante
 */
const RestaurantHubPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { restaurant, loading, error } = useRestaurantData(restaurantId!);
  const { navigateToCurrentRestaurant } = useRestaurantRoutes();
  const { effectiveFranchisee } = useAuth();
  
  // Get KPIs data for the restaurant
  const { kpis: hubData, isLoading: hubLoading } = useRestaurantHubKPIs(restaurantId);

  // Derive additional metrics from available data
  const performanceScore = hubData ? Math.min(100, (hubData.totalRevenue / 1000000) * 100) : 0;
  const budgetStatus = hubData ? 
    (Math.abs(hubData.monthlyDeviation) < 5 ? 'on-track' : 
     hubData.monthlyDeviation > 5 ? 'over-budget' : 'under-budget') : 'neutral';
  const criticalIncidents = 0; // TODO: Add critical incidents to KPIs interface

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

  const getStatusForValue = (value: number | null, thresholds: { good: number; warning: number }): 'success' | 'warning' | 'error' | 'neutral' => {
    if (value === null) return 'neutral';
    if (value >= thresholds.good) return 'success';
    if (value >= thresholds.warning) return 'warning';
    return 'error';
  };

  const getIntegrationStatus = (status: string): 'success' | 'warning' | 'error' => {
    return status === 'connected' ? 'success' : 'error';
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
              {/* Restaurant Hub - 8 Tarjetas Operativas */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Hub Operativo</h2>
                <p className="text-muted-foreground">
                  Panel de control integral para {restaurant.base_restaurant?.restaurant_name}
                </p>
              </div>

              <HubGrid>
                {/* 1. KPIs Generales */}
                <HubCard
                  title="KPIs Generales"
                  icon={TrendingUp}
                  status={getStatusForValue(performanceScore, { good: 80, warning: 60 })}
                  onAction={() => navigateToCurrentRestaurant('analytics')}
                  actionLabel="Ver Analytics"
                  loading={hubLoading}
                >
                  <div className="space-y-2">
                    <HubKPIValue 
                      value={hubData?.totalRevenue || 0} 
                      type="currency" 
                      trend={hubData?.revenueGrowth || 0}
                      size="md"
                    />
                    <div className="text-xs text-muted-foreground">
                      Performance: {performanceScore?.toFixed(0) || 'N/A'}/100
                    </div>
                  </div>
                </HubCard>

                {/* 2. Equipo */}
                <HubCard
                  title="Equipo"
                  icon={Users}
                  status={getStatusForValue(hubData?.activeEmployees || 0, { good: 20, warning: 15 })}
                  onAction={() => navigateToCurrentRestaurant('staff')}
                  actionLabel="Gestionar Personal"
                  loading={hubLoading}
                >
                  <div className="space-y-2">
                    <HubKPIValue 
                      value={hubData?.activeEmployees || 0} 
                      type="number"
                      suffix="activos"
                      size="md"
                    />
                    <div className="text-xs text-muted-foreground">
                      Rotación: {hubData?.monthlyTurnover?.toFixed(1) || 'N/A'}% mensual
                    </div>
                  </div>
                </HubCard>

                {/* 3. Nómina */}
                <HubCard
                  title="Nómina"
                  icon={CreditCard}
                  status={getStatusForValue(hubData?.monthlyCost || 0, { good: 50000, warning: 40000 })}
                  onAction={() => navigateToCurrentRestaurant('payroll')}
                  actionLabel="Ver Nómina"
                  loading={hubLoading}
                >
                  <div className="space-y-2">
                    <HubKPIValue 
                      value={hubData?.monthlyCost || 0} 
                      type="currency"
                      size="md"
                    />
                    <div className="text-xs text-muted-foreground">
                      {hubData?.hoursWorked?.toFixed(0) || 'N/A'}h mensuales
                    </div>
                  </div>
                </HubCard>

                {/* 4. P&L */}
                <HubCard
                  title="P&L"
                  icon={BarChart3}
                  status={getStatusForValue(hubData?.netMargin || 0, { good: 15, warning: 10 })}
                  onAction={() => navigateToCurrentRestaurant('profit-loss')}
                  actionLabel="Ver Estados"
                  loading={hubLoading}
                >
                  <div className="space-y-2">
                    <HubKPIValue 
                      value={hubData?.ebitda || 0} 
                      type="currency"
                      size="md"
                    />
                    <div className="text-xs text-muted-foreground">
                      Margen neto: {hubData?.netMargin?.toFixed(1) || 'N/A'}%
                    </div>
                  </div>
                </HubCard>

                {/* 5. Presupuesto */}
                <HubCard
                  title="Presupuesto"
                  icon={DollarSign}
                  status={budgetStatus === 'on-track' ? 'success' : 
                          budgetStatus === 'over-budget' ? 'error' :
                          budgetStatus === 'under-budget' ? 'warning' : 'neutral'}
                  onAction={() => navigateToCurrentRestaurant('budget')}
                  actionLabel="Ver Presupuesto"
                  loading={hubLoading}
                >
                  <div className="space-y-2">
                    <HubKPIValue 
                      value={hubData?.monthlyDeviation || 0} 
                      type="percentage"
                      size="md"
                      prefix="Desv:"
                    />
                    <div className="text-xs text-muted-foreground">
                      Año completado: {hubData?.yearProgress?.toFixed(0) || 'N/A'}%
                    </div>
                  </div>
                </HubCard>

                {/* 6. Incidencias */}
                <HubCard
                  title="Incidencias"
                  icon={AlertTriangle}
                  status={criticalIncidents > 0 ? 'error' : 
                          (hubData?.activeIncidents || 0) > 3 ? 'warning' : 'success'}
                  onAction={() => navigateToCurrentRestaurant('incidents')}
                  actionLabel="Ver Incidencias"
                  loading={hubLoading}
                >
                  <div className="space-y-2">
                    <HubKPIValue 
                      value={hubData?.activeIncidents || 0} 
                      type="number"
                      suffix="activas"
                      size="md"
                    />
                    <div className="text-xs text-muted-foreground">
                      {criticalIncidents} críticas • {hubData?.avgResolutionTime?.toFixed(1) || 'N/A'}h resolución
                    </div>
                  </div>
                </HubCard>

                {/* 7. Integraciones */}
                <HubCard
                  title="Integraciones"
                  icon={Settings}
                  status={hubData?.orquestStatus === 'connected' && hubData?.biloopStatus === 'connected' ? 'success' :
                          hubData?.orquestStatus === 'connected' || hubData?.biloopStatus === 'connected' ? 'warning' : 'error'}
                  onAction={() => navigateToCurrentRestaurant('integrations')}
                  actionLabel="Configurar"
                  loading={hubLoading}
                >
                  <div className="space-y-2">
                    <HubStatusIndicator 
                      status={getIntegrationStatus(hubData?.orquestStatus || 'disconnected')}
                      label="Orquest"
                      subtitle={hubData?.lastSync ? 
                        `Sync: ${new Date(hubData.lastSync).toLocaleDateString()}` : 'Sin sync'}
                    />
                    <HubStatusIndicator 
                      status={getIntegrationStatus(hubData?.biloopStatus || 'disconnected')}
                      label="Biloop"
                      subtitle="Pendiente configuración"
                    />
                  </div>
                </HubCard>

                {/* 8. Documentos */}
                <HubCard
                  title="Documentos"
                  icon={FileText}
                  status={(hubData?.pendingDocuments || 0) > 3 ? 'error' : 
                          (hubData?.pendingDocuments || 0) > 1 ? 'warning' : 'success'}
                  onAction={() => navigateToCurrentRestaurant('analytics')}
                  actionLabel="Ver Documentos"
                  loading={hubLoading}
                >
                  <div className="space-y-2">
                    <HubKPIValue 
                      value={hubData?.pendingDocuments || 0} 
                      type="number"
                      suffix="pendientes"
                      size="md"
                    />
                    <div className="text-xs text-muted-foreground">
                      Última actualización: {hubData?.lastUpdate ? 
                        new Date(hubData.lastUpdate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </HubCard>
              </HubGrid>

              {/* Información Básica del Restaurante */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Información del Restaurante</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Dirección</div>
                      <div className="text-sm text-foreground">{restaurant.base_restaurant?.address}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Tipo</div>
                      <div className="text-sm text-foreground capitalize">
                        {restaurant.base_restaurant?.restaurant_type || 'Tradicional'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Apertura</div>
                      <div className="text-sm text-foreground">
                        {restaurant.base_restaurant?.opening_date 
                          ? new Date(restaurant.base_restaurant.opening_date).toLocaleDateString('es-ES')
                          : 'No disponible'
                        }
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Capacidad</div>
                      <div className="text-sm text-foreground">
                        {restaurant.base_restaurant?.seating_capacity 
                          ? `${restaurant.base_restaurant.seating_capacity} personas`
                          : 'No disponible'
                        }
                      </div>
                    </div>
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
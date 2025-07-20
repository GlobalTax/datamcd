
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useHRMetrics } from '@/hooks/useHRMetrics';
import { MetricsWidget } from './widgets/MetricsWidget';
import { RestaurantsWidget } from './widgets/RestaurantsWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { StatusWidget } from './widgets/StatusWidget';
import { HRDashboardWidget } from './widgets/HRDashboardWidget';
import { HRTrendsChart } from './widgets/HRTrendsChart';
import { AdvancedHRNotifications } from './widgets/AdvancedHRNotifications';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { LoadingState } from '@/components/layout/LoadingState';
import { FranchiseeSelector } from './FranchiseeSelector';
import { FranchiseeProvider } from '@/contexts/FranchiseeContext';

const UnifiedDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const {
    metrics,
    restaurants,
    franchisee,
    user,
    loading,
    error,
    connectionStatus,
    isImpersonating,
    effectiveFranchisee
  } = useDashboardData();

  const { metrics: hrMetrics, loading: hrLoading } = useHRMetrics(effectiveFranchisee?.id);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Mostrar loading solo durante la carga inicial
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  // Determinar título y descripción basado en el rol
  const isGlobalAdmin = user?.role === 'asesor' || user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  const getTitle = () => {
    if (isSuperAdmin) return "Panel de Gestión Global";
    if (isGlobalAdmin) return "Panel de Asesor";
    return "Mi Dashboard";
  };

  const getDescription = () => {
    if (isSuperAdmin) return "Control total del sistema - Restaurantes, Franquiciados y Usuarios";
    if (isGlobalAdmin) return "Gestión de restaurantes y franquiciados asignados";
    return "Panel principal de gestión de mis restaurantes";
  };

  // Datos de ejemplo para gráfico de tendencias RRHH
  const hrTrendsData = [
    { month: 'Ene', empleados: 28, costoLaboral: 125000, horasTrabajadas: 4480, rotacion: 2.1 },
    { month: 'Feb', empleados: 30, costoLaboral: 130000, horasTrabajadas: 4800, rotacion: 1.8 },
    { month: 'Mar', empleados: 32, costoLaboral: 135000, horasTrabajadas: 5120, rotacion: 1.5 },
    { month: 'Abr', empleados: 31, costoLaboral: 132000, horasTrabajadas: 4960, rotacion: 2.3 },
    { month: 'May', empleados: 33, costoLaboral: 138000, horasTrabajadas: 5280, rotacion: 1.9 },
    { month: 'Jun', empleados: 35, costoLaboral: 142000, horasTrabajadas: 5600, rotacion: 1.6 },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <ImpersonationBanner />
          
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-900">{getTitle()}</h1>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium ${
                    connectionStatus === 'online' 
                      ? 'bg-green-100 text-green-700' 
                      : connectionStatus === 'offline'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'online' 
                        ? 'bg-green-500' 
                        : connectionStatus === 'offline'
                          ? 'bg-red-500'
                          : 'bg-blue-500 animate-pulse'
                    }`}></div>
                    <span>{connectionStatus === 'online' ? 'Sistema Activo' : connectionStatus === 'offline' ? 'Sin Conexión' : 'Reconectando'}</span>
                  </div>
                </div>
                
                {/* Selector de Franquiciado */}
                <FranchiseeSelector />
              </div>
              <p className="text-sm text-gray-500 mt-1">{getDescription()}</p>
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
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Métricas principales */}
              <MetricsWidget metrics={metrics} userRole={user?.role} />

              {/* Dashboard de RRHH - Widget Principal */}
              <HRDashboardWidget metrics={hrMetrics} loading={hrLoading} />

              {/* Layout principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna principal */}
                <div className="lg:col-span-2 space-y-6">
                  <RestaurantsWidget restaurants={restaurants} />
                  
                  {/* Gráficos de tendencias RRHH */}
                  <HRTrendsChart data={hrTrendsData} loading={hrLoading} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Sistema avanzado de notificaciones de RRHH */}
                  <AdvancedHRNotifications 
                    franchiseeId={effectiveFranchisee?.id}
                    onViewAll={() => navigate('/notifications')}
                  />
                  
                  <QuickActionsWidget userRole={user?.role} />
                  <StatusWidget
                    user={user}
                    franchisee={franchisee}
                    connectionStatus={connectionStatus}
                    isImpersonating={isImpersonating}
                    effectiveFranchisee={effectiveFranchisee}
                  />
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export const UnifiedDashboard: React.FC = () => {
  return (
    <FranchiseeProvider>
      <UnifiedDashboardContent />
    </FranchiseeProvider>
  );
};

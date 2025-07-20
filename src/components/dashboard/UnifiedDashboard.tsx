
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { MetricsWidget } from './widgets/MetricsWidget';
import { RestaurantsWidget } from './widgets/RestaurantsWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { StatusWidget } from './widgets/StatusWidget';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { LoadingState } from '@/components/layout/LoadingState';

export const UnifiedDashboard: React.FC = () => {
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

              {/* Layout principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna principal */}
                <div className="lg:col-span-2 space-y-6">
                  <RestaurantsWidget restaurants={restaurants} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
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


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { ConnectionStatus } from '@/components/dashboard/ConnectionStatus';
import { StatusAlerts } from '@/components/dashboard/StatusAlerts';
import { DashboardMetricsCards } from '@/components/dashboard/DashboardMetricsCards';
import { useDashboardData } from '@/hooks/useDashboardData';

const OptimizedDashboardPage = () => {
  const navigate = useNavigate();
  const {
    user,
    franchisee,
    restaurants,
    loading,
    connectionStatus,
    displayRestaurants,
    metrics,
    formatCurrency
  } = useDashboardData();

  console.log('OptimizedDashboardPage - Estado actual:', {
    user: user ? { id: user.id, role: user.role, email: user.email } : null,
    franchisee: franchisee ? { id: franchisee.id, name: franchisee.franchisee_name } : null,
    restaurantsCount: restaurants?.length || 0,
    loading
  });

  // Loading solo durante la carga inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
          <p className="text-sm text-gray-500 mt-2">Estado: {connectionStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900">Dashboard Unificado</h1>
                <ConnectionStatus connectionStatus={connectionStatus} />
              </div>
              <p className="text-sm text-gray-500">
                {connectionStatus === 'connected' 
                  ? `Datos en tiempo real desde Supabase - Usuario: ${user?.email}` 
                  : connectionStatus === 'fallback'
                    ? 'Usando datos temporales - Problema de conexión con Supabase'
                    : 'Conectando con la base de datos...'
                }
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
                Recargar
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <StatusAlerts 
                user={user}
                franchisee={franchisee}
                restaurants={restaurants}
                connectionStatus={connectionStatus}
              />

              <DashboardMetricsCards 
                metrics={metrics}
                formatCurrency={formatCurrency}
                connectionStatus={connectionStatus}
              />

              {/* Dashboard principal */}
              <DashboardSummary 
                totalRestaurants={metrics.totalRestaurants} 
                displayRestaurants={displayRestaurants}
                isTemporaryData={connectionStatus === 'fallback'}
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default OptimizedDashboardPage;

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelectedFranchiseeRestaurants } from '@/hooks/useSelectedFranchiseeRestaurants';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useHRMetrics } from '@/hooks/useHRMetrics';
import { useFranchiseeContext } from '@/contexts/FranchiseeContext';
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
  const { user, franchisee, connectionStatus, isImpersonating, effectiveFranchisee } = useUnifiedAuth();
  
  console.log('UnifiedDashboard - Rendering with user:', user?.email);
  console.log('UnifiedDashboard - Connection status:', connectionStatus);
  console.log('UnifiedDashboard - Effective franchisee:', effectiveFranchisee?.franchisee_name);
  
  const { restaurants, isLoading: restaurantsLoading, error: restaurantsError } = useSelectedFranchiseeRestaurants();
  const { selectedFranchisee } = useFranchiseeContext();
  
  const { metrics: hrMetrics, loading: hrLoading } = useHRMetrics(effectiveFranchisee?.id);

  console.log('UnifiedDashboard - Restaurants count:', restaurants?.length || 0);
  console.log('UnifiedDashboard - Restaurants loading:', restaurantsLoading);

  const handleRefresh = () => {
    console.log('UnifiedDashboard - Refreshing page');
    window.location.reload();
  };

  const metrics = React.useMemo(() => {
    console.log('UnifiedDashboard - Calculating metrics for restaurants:', restaurants?.length || 0);
    
    if (!restaurants || restaurants.length === 0) {
      return {
        totalRestaurants: 0,
        totalRevenue: 0,
        averageRevenue: 0,
        operatingMargin: 0,
        averageROI: 0,
        alerts: 0,
        tasks: 0,
        revenueGrowth: 0
      };
    }

    const totalRevenue = restaurants.reduce((sum, r) => {
      const revenue = r.last_year_revenue || 0;
      return sum + revenue;
    }, 0);
    
    const totalRent = restaurants.reduce((sum, r) => {
      const rent = (r.monthly_rent || 0) * 12;
      return sum + rent;
    }, 0);

    const operatingIncome = totalRevenue - totalRent;
    const operatingMargin = totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0;
    const averageROI = totalRent > 0 ? (operatingIncome / totalRent) * 100 : 0;
    const averageRevenue = restaurants.length > 0 ? totalRevenue / restaurants.length : 0;

    return {
      totalRestaurants: restaurants.length,
      totalRevenue,
      averageRevenue,
      operatingMargin,
      averageROI,
      alerts: 3,
      tasks: 5,
      revenueGrowth: 8.2
    };
  }, [restaurants]);

  if (!user) {
    console.log('UnifiedDashboard - No user found, showing loading');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

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

  const hrTrendsData = [
    { month: 'Ene', empleados: 28, costoLaboral: 125000, horasTrabajadas: 4480, rotacion: 2.1 },
    { month: 'Feb', empleados: 30, costoLaboral: 130000, horasTrabajadas: 4800, rotacion: 1.8 },
    { month: 'Mar', empleados: 32, costoLaboral: 135000, horasTrabajadas: 5120, rotacion: 1.5 },
    { month: 'Abr', empleados: 31, costoLaboral: 132000, horasTrabajadas: 4960, rotacion: 2.3 },
    { month: 'May', empleados: 33, costoLaboral: 138000, horasTrabajadas: 5280, rotacion: 1.9 },
    { month: 'Jun', empleados: 35, costoLaboral: 142000, horasTrabajadas: 5600, rotacion: 1.6 },
  ];

  console.log('UnifiedDashboard - Rendering dashboard with title:', getTitle());

  return (
    <>
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
            
            <FranchiseeSelector />
          </div>
          <p className="text-sm text-gray-500 mt-1">{getDescription()}</p>
          {selectedFranchisee && (
            <p className="text-xs text-blue-600 mt-1">
              Mostrando datos de: {selectedFranchisee.franchisee_name}
            </p>
          )}
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
          {(!restaurants || restaurants.length === 0) && !restaurantsLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-blue-800">
                  {isGlobalAdmin 
                    ? "Selecciona un franquiciado para ver sus datos o verifica que existan restaurantes asignados." 
                    : "No hay restaurantes asignados actualmente. Contacta con tu asesor para más información."
                  }
                </p>
              </div>
            </div>
          )}

          <MetricsWidget metrics={metrics} userRole={user?.role} />
          <HRDashboardWidget metrics={hrMetrics} loading={hrLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <RestaurantsWidget restaurants={restaurants || []} />
              <HRTrendsChart data={hrTrendsData} loading={hrLoading} />
            </div>

            <div className="space-y-6">
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
    </>
  );
};

export const UnifiedDashboard: React.FC = () => {
  return (
    <FranchiseeProvider>
      <UnifiedDashboardContent />
    </FranchiseeProvider>
  );
};

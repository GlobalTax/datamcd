import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, MapPin, Calendar, DollarSign, Users, BarChart3, Calculator, Database, TrendingUp, UserCheck, AlertTriangle, Receipt, Cog } from 'lucide-react';

// Import existing components
import { WorkersPanel } from '@/components/workers/WorkersPanel';
import { AnnualBudgetGrid } from '@/components/budget/AnnualBudgetGrid';
import ProfitLossDashboard from '@/components/profitloss/ProfitLossDashboard';
import { AnalysisDashboard } from '@/components/analysis/AnalysisDashboard';
import { EmployeeManagement } from '@/components/employees/EmployeeManagement';
import { IncidentManagement } from '@/components/incidents/IncidentManagement';
import { OrquestDashboard } from '@/components/orquest/OrquestDashboard';
import { QuantumSyncStatus } from '@/components/quantum/QuantumSyncStatus';

const RestaurantHub = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurants, loading, effectiveFranchisee } = useUnifiedAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Encontrar el restaurante actual
  const restaurant = restaurants.find(r => r.id === restaurantId);

  // Determinar la pestaña activa basada en la URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/workers')) setActiveTab('workers');
    else if (path.includes('/employees')) setActiveTab('employees');
    else if (path.includes('/budgets')) setActiveTab('budgets');
    else if (path.includes('/profit-loss')) setActiveTab('profit-loss');
    else if (path.includes('/analysis')) setActiveTab('analysis');
    else if (path.includes('/valuation')) setActiveTab('valuation');
    else if (path.includes('/incidents')) setActiveTab('incidents');
    else if (path.includes('/orquest')) setActiveTab('orquest');
    else if (path.includes('/integrations')) setActiveTab('integrations');
    else setActiveTab('overview');
  }, [location.pathname]);

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
          <p className="text-gray-600">Cargando restaurante...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <ImpersonationBanner />
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">Restaurante no encontrado</h1>
              </div>
              <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </header>
            <main className="flex-1 p-6 flex items-center justify-center">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Restaurante no encontrado
                  </h3>
                  <p className="text-gray-500 text-center max-w-md mb-4">
                    No se pudo encontrar el restaurante solicitado o no tienes permisos para acceder a él.
                  </p>
                  <Button onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Dashboard
                  </Button>
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <ImpersonationBanner />
          
          {/* Header del restaurante */}
          <header className="border-b bg-white">
            <div className="flex h-16 shrink-0 items-center gap-2 px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1 flex items-center gap-4">
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  variant="ghost" 
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {restaurant.base_restaurant?.restaurant_name || 'Restaurante'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {restaurant.base_restaurant?.city || 'Ciudad'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Código: {restaurant.base_restaurant?.site_number || 'N/A'}
                    </span>
                    <Badge className={getStatusColor(restaurant.status || 'active')}>
                      {restaurant.status === 'active' ? 'Activo' : 
                       restaurant.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Navegación por tabs */}
            <div className="px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-9 lg:w-auto lg:inline-flex bg-gray-100">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Resumen</span>
                  </TabsTrigger>
                  <TabsTrigger value="workers" className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Trabajadores</span>
                  </TabsTrigger>
                  <TabsTrigger value="employees" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Empleados</span>
                  </TabsTrigger>
                  <TabsTrigger value="budgets" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Presupuestos</span>
                  </TabsTrigger>
                  <TabsTrigger value="profit-loss" className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span className="hidden sm:inline">P&L</span>
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Análisis</span>
                  </TabsTrigger>
                  <TabsTrigger value="incidents" className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="hidden sm:inline">Incidencias</span>
                  </TabsTrigger>
                  <TabsTrigger value="orquest" className="flex items-center gap-2">
                    <Cog className="w-4 h-4" />
                    <span className="hidden sm:inline">Orquest</span>
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    <span className="hidden sm:inline">Integraciones</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </header>

          <main className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
              {/* Resumen del restaurante */}
              <TabsContent value="overview" className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Info básica */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Información General
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Dirección</p>
                        <p className="font-medium">{restaurant.base_restaurant?.address || 'No especificada'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tipo</p>
                        <p className="font-medium">{restaurant.base_restaurant?.restaurant_type || 'Tradicional'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Apertura</p>
                        <p className="font-medium">{restaurant.base_restaurant?.opening_date || 'No especificada'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métricas financieras */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Métricas Financieras
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {restaurant.last_year_revenue && (
                        <div>
                          <p className="text-sm text-gray-500">Ingresos Último Año</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(restaurant.last_year_revenue)}
                          </p>
                        </div>
                      )}
                      {restaurant.monthly_rent && (
                        <div>
                          <p className="text-sm text-gray-500">Renta Mensual</p>
                          <p className="font-medium">{formatCurrency(restaurant.monthly_rent)}</p>
                        </div>
                      )}
                      {restaurant.franchise_fee_percentage && (
                        <div>
                          <p className="text-sm text-gray-500">Fee Franquicia</p>
                          <p className="font-medium">{restaurant.franchise_fee_percentage}%</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Estado operativo */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Estado Operativo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        <Badge className={getStatusColor(restaurant.status || 'active')}>
                          {restaurant.status === 'active' ? 'Operativo' : 
                           restaurant.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Franquiciado</p>
                        <p className="font-medium">{effectiveFranchisee?.franchisee_name || 'No asignado'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Contrato</p>
                        <p className="font-medium">
                          {restaurant.franchise_start_date ? 
                            `${restaurant.franchise_start_date} - ${restaurant.franchise_end_date || 'Indefinido'}` :
                            'No especificado'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Accesos rápidos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Accesos Rápidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col gap-2"
                        onClick={() => setActiveTab('workers')}
                      >
                        <UserCheck className="w-6 h-6" />
                        <span>Panel Trabajadores</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col gap-2"
                        onClick={() => setActiveTab('profit-loss')}
                      >
                        <Database className="w-6 h-6" />
                        <span>Datos P&L</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col gap-2"
                        onClick={() => setActiveTab('analysis')}
                      >
                        <TrendingUp className="w-6 h-6" />
                        <span>Análisis</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex flex-col gap-2"
                        onClick={() => setActiveTab('budgets')}
                      >
                        <Calendar className="w-6 h-6" />
                        <span>Presupuestos</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Panel de trabajadores (Orquest + IntegraLOOP) */}
              <TabsContent value="workers" className="p-6">
                <WorkersPanel />
              </TabsContent>

              {/* Gestión de empleados local */}
              <TabsContent value="employees" className="p-6">
                <EmployeeManagement 
                  restaurantId={restaurantId || ''} 
                  restaurantName={restaurant.base_restaurant?.restaurant_name || 'Restaurante'} 
                />
              </TabsContent>

              {/* Presupuestos anuales */}
              <TabsContent value="budgets" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Presupuestos Anuales</h2>
                    <p className="text-gray-600">Gestiona los presupuestos por categorías y meses.</p>
                  </div>
                  <AnnualBudgetGrid 
                    restaurantId={restaurantId || ''} 
                    year={new Date().getFullYear()} 
                  />
                </div>
              </TabsContent>

              {/* Datos históricos P&L */}
              <TabsContent value="profit-loss" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Profit & Loss</h2>
                    <p className="text-gray-600">Histórico de datos financieros y P&L del restaurante.</p>
                  </div>
                  <ProfitLossDashboard restaurantId={restaurantId || ''} />
                </div>
              </TabsContent>

              {/* Análisis y valoración */}
              <TabsContent value="analysis" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Análisis y Valoración</h2>
                    <p className="text-gray-600">Análisis financiero completo y herramientas de valoración.</p>
                  </div>
                  <AnalysisDashboard />
                </div>
              </TabsContent>

              {/* Gestión de incidencias */}
              <TabsContent value="incidents" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Incidencias</h2>
                    <p className="text-gray-600">Seguimiento y resolución de incidencias del restaurante.</p>
                  </div>
                  <IncidentManagement />
                </div>
              </TabsContent>

              {/* Orquest */}
              <TabsContent value="orquest" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Orquest Integration</h2>
                    <p className="text-gray-600">Gestión de datos operacionales y sincronización con Orquest.</p>
                  </div>
                  <OrquestDashboard />
                </div>
              </TabsContent>

              {/* Integraciones (Biloop, Quantum, etc.) */}
              <TabsContent value="integrations" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Integraciones</h2>
                    <p className="text-gray-600">Estado y configuración de integraciones externas.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="w-5 h-5" />
                          IntegraLOOP (Biloop)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Integración para datos de nómina y gestión de empleados.
                        </p>
                        <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5" />
                          Quantum
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Sincronización de datos contables y financieros.
                        </p>
                        <QuantumSyncStatus />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RestaurantHub;
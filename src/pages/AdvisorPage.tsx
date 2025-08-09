import React, { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  FileText, 
  LogOut, 
  Store, 
  BarChart3, 
  TrendingUp, 
  Bell, 
  Activity, 
  Monitor,
  Menu,
  X,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useFranchisees } from '@/hooks/useFranchisees';
import { useRestaurants } from '@/hooks/data/useRestaurants';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { LoadingFallback } from '@/components/common/LoadingFallback';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AppNavbar } from '@/components/navigation/AppNavbar';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Seo } from '@/components/seo/Seo';

// Lazy loading de módulos pesados
const AdvancedDashboard = React.lazy(() => import('@/components/advisor/AdvancedDashboard').then(m => ({ default: m.AdvancedDashboard })));
const FranchiseesManagement = React.lazy(() => import('@/components/FranchiseesManagement').then(m => ({ default: m.FranchiseesManagement })));
const AdvisorReports = React.lazy(() => import('@/components/AdvisorReports').then(m => ({ default: m.AdvisorReports })));
const UnifiedRestaurantsTable = React.lazy(() => import('@/components/UnifiedRestaurantsTable').then(m => ({ default: m.UnifiedRestaurantsTable })));
const NotificationCenter = React.lazy(() => import('@/components/advisor/NotificationCenter').then(m => ({ default: m.NotificationCenter })));
const AdvancedReports = React.lazy(() => import('@/components/advisor/AdvancedReports').then(m => ({ default: m.AdvancedReports })));
const OrquestDashboard = React.lazy(() => import('@/components/orquest/OrquestDashboard').then(m => ({ default: m.OrquestDashboard })));
const NewIncidentManagement = React.lazy(() => import('@/components/incidents/NewIncidentManagement').then(m => ({ default: m.NewIncidentManagement })));
const AdvisorManagement = React.lazy(() => import('@/components/AdvisorManagement'));

// Prefetch de módulos bajo demanda y en segundo plano
const prefetched = new Set<string>();
const modulePrefetchers: Record<string, () => Promise<unknown>> = {
  dashboard: () => import('@/components/advisor/AdvancedDashboard'),
  franchisees: () => import('@/components/FranchiseesManagement'),
  restaurants: () => import('@/components/UnifiedRestaurantsTable'),
  orquest: () => import('@/components/orquest/OrquestDashboard'),
  analytics: () => import('@/components/advisor/AdvancedReports'),
  reports: () => import('@/components/AdvisorReports'),
  notifications: () => import('@/components/advisor/NotificationCenter'),
  management: () => import('@/components/AdvisorManagement'),
  incidents: () => import('@/components/incidents/NewIncidentManagement'),
};

const prefetchTab = (id: string) => {
  if (prefetched.has(id)) return;
  const fn = modulePrefetchers[id];
  if (fn) {
    fn().finally(() => prefetched.add(id));
  }
};

const AdvisorPage = () => {
  const { user, signOut, loading } = useUnifiedAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Listen for sidebar navigation messages
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADVISOR_TAB_CHANGE') {
        setActiveTab(event.data.tab);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Prefetch de pestañas comunes en segundo plano cuando el hilo está ocioso
  React.useEffect(() => {
    const warm = () => ['franchisees', 'restaurants', 'reports'].forEach(prefetchTab);
    // @ts-ignore
    const ric = (window as any).requestIdleCallback as ((cb: () => void, opts?: any) => number) | undefined;
    if (ric) {
      ric(warm, { timeout: 1500 });
      return;
    }
    const t = setTimeout(warm, 1500);
    return () => clearTimeout(t);
  }, []);
  const { restaurants: rawRestaurants, isLoading: restaurantsLoading, refetch: refetchRestaurants, stats } = useRestaurants();
  
  // Transform to UnifiedRestaurant format
  const restaurants = React.useMemo(() => {
    return rawRestaurants.map(restaurant => ({
      ...restaurant,
      isAssigned: !!restaurant.franchisee_id,
      assignment: restaurant.franchisee_id ? {
        id: restaurant.id,
        franchisee_id: restaurant.franchisee_id,
        franchise_start_date: (restaurant as any).franchise_start_date,
        franchise_end_date: (restaurant as any).franchise_end_date,
        monthly_rent: (restaurant as any).monthly_rent,
        status: restaurant.status,
        assigned_at: restaurant.created_at,
      } : undefined,
    }));
  }, [rawRestaurants]);
  const { franchisees, loading: franchiseesLoading } = useFranchisees();

  if (loading) {
    return <LoadingFallback message="Cargando panel de asesor..." />;
  }

  if (!user || !['asesor', 'admin', 'superadmin', 'advisor'].includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'asesor': return 'Asesor';
      default: return 'Asesor';
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
    { id: 'franchisees', label: 'Franquiciados', icon: Building, color: 'green' },
    { id: 'restaurants', label: 'Restaurantes', icon: Store, color: 'purple' },
    { id: 'valuation', label: 'Valoración', icon: TrendingUp, color: 'emerald' },
    { id: 'budgets', label: 'Presupuestos', icon: Activity, color: 'rose' },
    { id: 'orquest', label: 'Orquest', icon: Monitor, color: 'cyan' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'orange' },
    { id: 'reports', label: 'Reportes', icon: FileText, color: 'yellow' },
    { id: 'notifications', label: 'Alertas', icon: Bell, color: 'red' },
    { id: 'incidents', label: 'Incidencias', icon: AlertTriangle, color: 'orange' },
    { id: 'biloop', label: 'Biloop', icon: Receipt, color: 'cyan' },
    { id: 'management', label: 'Gestión', icon: Users, color: 'indigo' },
  ];

  const NavigationMenu = ({ mobile = false }) => (
    <div className={`${mobile ? 'px-4 py-2' : 'px-6 py-4'} space-y-2`}>
      {navigationItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${
            activeTab === item.id 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-muted'
          }`}
          onMouseEnter={() => prefetchTab(item.id)}
          onFocus={() => prefetchTab(item.id)}
          onClick={() => {
            setActiveTab(item.id);
            if (mobile) setSidebarOpen(false);
          }}
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </Button>
      ))}
    </div>
  );

  const getCurrentPageTitle = () => {
    const item = navigationItems.find(item => item.id === activeTab);
    return item?.label || 'Dashboard';
  };

  return (
    <ProtectedRoute>
      <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ConnectionStatus />
        <Seo
          title={`${getCurrentPageTitle()} · McDonald's Portal`}
          description="Panel de asesor con KPIs, franquiciados, restaurantes y reportes."
          canonicalUrl={`${window.location.origin}/advisor`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${window.location.origin}/` },
                { '@type': 'ListItem', position: 2, name: 'Advisor', item: `${window.location.origin}/advisor` },
                { '@type': 'ListItem', position: 3, name: getCurrentPageTitle() },
              ],
            }),
          }}
        />
        {/* Mobile Navigation */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <div className="h-full flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Store className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-foreground">Panel Asesor</h1>
                      <p className="text-sm text-muted-foreground">
                        {user.full_name}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavigationMenu mobile={true} />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 min-h-screen bg-card border-r shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Store className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Panel de Asesor</h1>
                  <p className="text-sm text-muted-foreground">
                    {user.full_name} • {getRoleDisplay(user.role)}
                  </p>
                </div>
              </div>
            </div>
            
            <NavigationMenu />
            
            <div className="absolute bottom-0 w-80 p-6 border-t bg-card">
              {/* Botón de cerrar sesión eliminado - se mantiene solo el del header */}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AppNavbar
              title={getCurrentPageTitle()}
              subtitle="Gestión integral de franquicias McDonald's"
              counts={[
                { label: 'franquiciados', value: franchisees.length },
                { label: 'restaurantes', value: restaurants.length },
              ]}
              onSignOut={handleSignOut}
              onOpenSidebar={() => setSidebarOpen(true)}
            />

            {/* Page Content */}
            <main id="main-content" className="p-6">
              <React.Suspense fallback={<LoadingFallback variant="page" message="Cargando contenido..." />}>
              <div className="max-w-7xl mx-auto">
                <Breadcrumbs
                  items={[
                    { label: 'Inicio', href: '/' },
                    { label: 'Advisor', href: '/advisor' },
                    { label: getCurrentPageTitle() }
                  ]}
                  className="mb-4"
                />
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Franquiciados</p>
                          <p className="text-3xl font-bold text-blue-900">{franchiseesLoading ? '...' : franchisees.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Building className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700">Restaurantes</p>
                          <p className="text-3xl font-bold text-green-900">{restaurants.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Store className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700">Actividad</p>
                          <p className="text-3xl font-bold text-purple-900">95%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-700">Rendimiento</p>
                          <p className="text-3xl font-bold text-emerald-900">+8.2%</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Content Areas */}
                <div className="space-y-6">
                  {activeTab === 'dashboard' && (
                    <ErrorBoundary>
                      <AdvancedDashboard />
                    </ErrorBoundary>
                  )}

                  {activeTab === 'franchisees' && (
                    <ErrorBoundary>
                      <FranchiseesManagement />
                    </ErrorBoundary>
                  )}

                  {activeTab === 'restaurants' && (
                    <ErrorBoundary>
                      <UnifiedRestaurantsTable 
                        restaurants={restaurants} 
                        loading={restaurantsLoading}
                        onRefresh={refetchRestaurants}
                        stats={stats}
                      />
                    </ErrorBoundary>
                  )}

                  {activeTab === 'orquest' && (
                    <ErrorBoundary>
                      <OrquestDashboard />
                    </ErrorBoundary>
                  )}

                  {activeTab === 'analytics' && (
                    <ErrorBoundary>
                      <AdvancedReports />
                    </ErrorBoundary>
                  )}

                  {activeTab === 'reports' && (
                    <ErrorBoundary>
                      <Card className="border-0 shadow-lg bg-card">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">Reportes y Análisis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <AdvisorReports />
                        </CardContent>
                      </Card>
                    </ErrorBoundary>
                  )}

                  {activeTab === 'notifications' && (
                    <ErrorBoundary>
                      <NotificationCenter />
                    </ErrorBoundary>
                  )}

                  {activeTab === 'valuation' && (
                    <ErrorBoundary>
                      <Card className="border-0 shadow-lg bg-card">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">Accesos Rápidos - Valoración</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button 
                              onClick={() => navigate('/valuation')} 
                              className="h-20 text-left p-6 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
                              variant="outline"
                            >
                              <div>
                                <h3 className="font-semibold">Valoración DCF</h3>
                                <p className="text-sm">Flujos de caja descontados</p>
                              </div>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </ErrorBoundary>
                  )}

                  {activeTab === 'budgets' && (
                    <ErrorBoundary>
                      <Card className="border-0 shadow-lg bg-card">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">Accesos Rápidos - Presupuestos</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button 
                              onClick={() => navigate('/annual-budget')} 
                              className="h-20 text-left p-6 bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700"
                              variant="outline"
                            >
                              <div>
                                <h3 className="font-semibold">Presupuestos Anuales</h3>
                                <p className="text-sm">Planificación mensual detallada</p>
                              </div>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </ErrorBoundary>
                  )}

                  {activeTab === 'management' && (
                    <ErrorBoundary>
                      <Card className="border-0 shadow-lg bg-card">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">Gestión de Asesores y Administradores</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <AdvisorManagement />
                        </CardContent>
                      </Card>
                    </ErrorBoundary>
                  )}

                  {activeTab === 'incidents' && (
                    <ErrorBoundary>
                      <NewIncidentManagement />
                    </ErrorBoundary>
                  )}

                  {activeTab === 'biloop' && (
                    <ErrorBoundary>
                      <Card className="border-0 shadow-lg bg-card">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">Accesos Rápidos - Biloop</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-4">
                            <Button 
                              onClick={() => navigate('/biloop')} 
                              className="h-20 text-left p-6 bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-700"
                              variant="outline"
                            >
                              <div>
                                <h3 className="font-semibold">Panel Biloop</h3>
                                <p className="text-sm">Gestión de nóminas y trabajadores</p>
                              </div>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </ErrorBoundary>
                  )}
                </div>
              </div>
              </React.Suspense>
            </main>
          </div>
        </div>
      </div>
      </ErrorBoundary>
    </ProtectedRoute>
  );
};

export default AdvisorPage;
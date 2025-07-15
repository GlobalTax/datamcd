import React, { useState } from 'react';
import { useSimpleAuth } from '@/hooks/auth/useSimpleAuth';
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
  X
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import AdvisorManagement from '@/components/AdvisorManagement';
import { FranchiseesManagement } from '@/components/FranchiseesManagement';
import { useFranchisees } from '@/hooks/useFranchisees';
import { AdvisorReports } from '@/components/AdvisorReports';
import { UnifiedRestaurantsTable } from '@/components/UnifiedRestaurantsTable';
import { useUnifiedRestaurants } from '@/hooks/useUnifiedRestaurants';
import { AdvancedDashboard } from '@/components/advisor/AdvancedDashboard';
import { NotificationCenter } from '@/components/advisor/NotificationCenter';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdvancedReports } from '@/components/advisor/AdvancedReports';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { LoadingFallback } from '@/components/common/LoadingFallback';
import { OrquestDashboard } from '@/components/orquest/OrquestDashboard';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdvisorPage = () => {
  const { user, signOut, loading } = useSimpleAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { restaurants, loading: restaurantsLoading, refetch: refetchRestaurants, stats } = useUnifiedRestaurants();
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
    { id: 'orquest', label: 'Orquest', icon: Monitor, color: 'cyan' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'orange' },
    { id: 'reports', label: 'Reportes', icon: FileText, color: 'yellow' },
    { id: 'notifications', label: 'Alertas', icon: Bell, color: 'red' },
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
    <ProtectedRoute allowedRoles={['admin', 'asesor', 'advisor', 'superadmin']}>
      <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ConnectionStatus />
        
        {/* Mobile Navigation */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
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
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-start gap-3 border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <header className="bg-card border-b shadow-sm">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="lg:hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{getCurrentPageTitle()}</h1>
                      <p className="text-muted-foreground">
                        Gestión integral de franquicias McDonald's
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="hidden sm:inline-flex">
                        {franchisees.length} franquiciados
                      </Badge>
                      <Badge variant="secondary" className="hidden sm:inline-flex">
                        {restaurants.length} restaurantes
                      </Badge>
                    </div>
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="hidden lg:flex"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="p-6">
              <div className="max-w-7xl mx-auto">
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
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
    </ProtectedRoute>
  );
};

export default AdvisorPage;
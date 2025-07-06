
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building, Users, FileText, LogOut, Store, BarChart3, TrendingUp, Building2, Bell, Activity, Target, Monitor } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import AdvisorManagement from '@/components/AdvisorManagement';
import { FranchiseesManagement } from '@/components/FranchiseesManagement';
import { useFranchisees } from '@/hooks/useFranchisees';
import { AdvisorReports } from '@/components/AdvisorReports';
import { UnifiedRestaurantsTable } from '@/components/UnifiedRestaurantsTable';
import { useUnifiedRestaurants } from '@/hooks/useUnifiedRestaurants';
import { AdvancedDashboard } from '@/components/advisor/AdvancedDashboard';
import { NotificationCenter } from '@/components/advisor/NotificationCenter';
import { AdvancedReports } from '@/components/advisor/AdvancedReports';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { LoadingFallback } from '@/components/common/LoadingFallback';

const AdvisorPage = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { restaurants, loading: restaurantsLoading, refetch: refetchRestaurants, stats } = useUnifiedRestaurants();
  const { franchisees, loading: franchiseesLoading } = useFranchisees();

  if (loading) {
    return <LoadingFallback message="Cargando panel de asesor..." />;
  }

  if (!user || !['asesor', 'admin', 'superadmin'].includes(user.role)) {
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <ConnectionStatus />
        {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <Store className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Asesor</h1>
                <p className="text-sm text-gray-500">
                  {user.full_name} • {getRoleDisplay(user.role)}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Asesores</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Franquiciados</p>
                  <p className="text-3xl font-bold text-gray-900">{franchiseesLoading ? '...' : franchisees.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Restaurantes</p>
                  <p className="text-3xl font-bold text-gray-900">{restaurants.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rendimiento</p>
                  <p className="text-3xl font-bold text-green-600">+8.2%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white border border-gray-200 p-1 rounded-xl">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg"
            >
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="franchisees" 
              className="flex items-center gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 rounded-lg"
            >
              <Building className="w-4 h-4" />
              Franquiciados
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg"
            >
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger 
              value="advanced_reports" 
              className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 rounded-lg"
            >
              <Target className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="advisors" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 rounded-lg"
            >
              <Users className="w-4 h-4" />
              Gestión
            </TabsTrigger>
            <TabsTrigger 
              value="restaurants" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 rounded-lg"
            >
              <Store className="w-4 h-4" />
              Restaurantes
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-2 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-600 rounded-lg"
            >
              <FileText className="w-4 h-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ErrorBoundary>
              <AdvancedDashboard />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="franchisees">
            <ErrorBoundary>
              <FranchiseesManagement />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="notifications">
            <ErrorBoundary>
              <NotificationCenter />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="advanced_reports">
            <ErrorBoundary>
              <AdvancedReports />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="advisors">
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
          </TabsContent>

          <TabsContent value="restaurants">
            <ErrorBoundary>
              <UnifiedRestaurantsTable 
                restaurants={restaurants} 
                loading={restaurantsLoading}
                onRefresh={refetchRestaurants}
                stats={stats}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="reports">
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
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdvisorPage;

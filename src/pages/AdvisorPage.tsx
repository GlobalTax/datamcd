
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Building, Users, FileText, LogOut, Store, BarChart3, TrendingUp, Building2 } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import AdvisorManagement from '@/components/AdvisorManagement';
import { FranchiseesManagement } from '@/components/FranchiseesManagement';
import { AdvisorReports } from '@/components/AdvisorReports';
import { BaseRestaurantsTable } from '@/components/BaseRestaurantsTable';
import { useBaseRestaurants } from '@/hooks/useBaseRestaurants';

const AdvisorPage = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('advisors');
  const { restaurants, loading: restaurantsLoading, refetch: refetchRestaurants } = useBaseRestaurants();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600 rounded-xl animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gray-50">
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
                  <p className="text-3xl font-bold text-gray-900">45</p>
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
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1 rounded-xl">
            <TabsTrigger 
              value="advisors" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg"
            >
              <Users className="w-4 h-4" />
              Asesores
            </TabsTrigger>
            <TabsTrigger 
              value="franchisees" 
              className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 rounded-lg"
            >
              <Building className="w-4 h-4" />
              Franquiciados
            </TabsTrigger>
            <TabsTrigger 
              value="restaurants" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 rounded-lg"
            >
              <Store className="w-4 h-4" />
              Restaurantes
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 rounded-lg"
            >
              <FileText className="w-4 h-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="advisors">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Gestión de Asesores y Administradores</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvisorManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="franchisees">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Gestión de Franquiciados</CardTitle>
              </CardHeader>
              <CardContent>
                <FranchiseesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurants">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Gestión de Restaurantes Base</CardTitle>
              </CardHeader>
              <CardContent>
                {restaurantsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 bg-red-600 rounded-xl animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando restaurantes...</p>
                  </div>
                ) : (
                  <BaseRestaurantsTable 
                    restaurants={restaurants} 
                    onRefresh={refetchRestaurants}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Reportes y Análisis</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvisorReports />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvisorPage;

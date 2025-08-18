import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { EmployeeManagement } from '@/components/employees/EmployeeManagement';
import { RestaurantMembersManager } from '@/components/restaurant/RestaurantMembersManager';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield } from 'lucide-react';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';

/**
 * Página de gestión de personal para un restaurante específico
 */
const RestaurantStaffPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { restaurant, loading, error } = useRestaurantData(restaurantId!);
  const [activeTab, setActiveTab] = useState('employees');

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
                  <Users className="w-16 h-16 mx-auto mb-4 text-red-400" />
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <ImpersonationBanner />
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Gestión de Personal</h1>
              <p className="text-sm text-gray-500">
                {restaurant.base_restaurant?.restaurant_name} • #{restaurant.base_restaurant?.site_number}
              </p>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employees" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Empleados
                </TabsTrigger>
                <TabsTrigger value="access" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Accesos y Permisos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="employees" className="space-y-6">
                <EmployeeManagement
                  restaurantId={restaurantId!}
                  restaurantName={
                    restaurant.base_restaurant?.restaurant_name || 
                    `Restaurante ${restaurant.base_restaurant?.site_number}`
                  }
                />
              </TabsContent>

              <TabsContent value="access" className="space-y-6">
                <RestaurantMembersManager
                  restaurantId={restaurantId!}
                  showHeader={false}
                />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RestaurantStaffPage;
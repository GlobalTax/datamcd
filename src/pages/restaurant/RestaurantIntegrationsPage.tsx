import React from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { BiloopWorkersPanel } from '@/components/workers/BiloopWorkersPanel';
import { OrquestDashboard } from '@/components/orquest/OrquestDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Cog } from 'lucide-react';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';

/**
 * Página de integraciones para un restaurante específico
 * Incluye Biloop, Orquest y otras integraciones
 */
const RestaurantIntegrationsPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { restaurant, loading, error } = useRestaurantData(restaurantId!);

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
                  <Cog className="w-16 h-16 mx-auto mb-4 text-red-400" />
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
              <h1 className="text-lg font-semibold text-gray-900">Integraciones</h1>
              <p className="text-sm text-gray-500">
                {restaurant.base_restaurant?.restaurant_name} • #{restaurant.base_restaurant?.site_number}
              </p>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs defaultValue="biloop" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="biloop">Biloop</TabsTrigger>
                <TabsTrigger value="orquest">Orquest</TabsTrigger>
              </TabsList>

              <TabsContent value="biloop" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Integración Biloop</h2>
                    <p className="text-sm text-gray-600">
                      Gestión de trabajadores y nóminas a través de Biloop
                    </p>
                  </div>
                  <BiloopWorkersPanel />
                </div>
              </TabsContent>

              <TabsContent value="orquest" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Integración Orquest</h2>
                    <p className="text-sm text-gray-600">
                      Planificación de turnos y gestión de personal
                    </p>
                  </div>
                  <OrquestDashboard />
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RestaurantIntegrationsPage;
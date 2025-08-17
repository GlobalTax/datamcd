import React from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { AnalysisTabs } from '@/components/analysis/AnalysisTabs';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';

/**
 * Página de análisis/analytics para un restaurante específico
 */
const RestaurantAnalyticsPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { restaurant, loading, error } = useRestaurantData(restaurantId!);
  const { restaurants } = useFranchiseeRestaurants();
  const currentYear = new Date().getFullYear();

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
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-red-400" />
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

  // AnalysisTabs espera selectedRestaurant como string (ID del restaurante)
  const selectedRestaurantId = restaurant.id;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <ImpersonationBanner />
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Análisis Financiero</h1>
              <p className="text-sm text-gray-500">
                {restaurant.base_restaurant?.restaurant_name} • #{restaurant.base_restaurant?.site_number}
              </p>
            </div>
          </header>

          <main className="flex-1 p-6">
            <AnalysisTabs
              selectedYear={currentYear}
              selectedRestaurant={selectedRestaurantId}
              restaurants={restaurants.map(r => ({
                id: r.id,
                restaurant_name: r.base_restaurant?.restaurant_name || '',
                site_number: r.base_restaurant?.site_number || '',
                city: r.base_restaurant?.city || '',
              }))}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RestaurantAnalyticsPage;
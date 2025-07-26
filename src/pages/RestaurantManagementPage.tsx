
import React from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useRestaurants } from '@/hooks/data/useRestaurants';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { UnifiedRestaurantsTable } from '@/components/UnifiedRestaurantsTable';

const RestaurantManagementPage = () => {
  const { user } = useUnifiedAuth();
  const { restaurants: rawRestaurants, isLoading: loading, refetch, stats } = useRestaurants();

  // Adapt Restaurant[] to UnifiedRestaurant[]
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

  console.log('RestaurantManagementPage - User:', user ? { id: user.id, role: user.role } : null);
  console.log('RestaurantManagementPage - Restaurants:', restaurants.length, restaurants);
  console.log('RestaurantManagementPage - Loading:', loading);
  console.log('RestaurantManagementPage - Stats:', stats);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del usuario...</p>
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
              <h1 className="text-lg font-semibold text-gray-900">Gestión de Restaurantes</h1>
              <p className="text-sm text-gray-500">
                Vista completa de todos los restaurantes del sistema
              </p>
            </div>
          </header>

          <main className="flex-1 p-6">
            <UnifiedRestaurantsTable 
              restaurants={restaurants}
              loading={loading}
              onRefresh={refetch}
              stats={stats}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RestaurantManagementPage;

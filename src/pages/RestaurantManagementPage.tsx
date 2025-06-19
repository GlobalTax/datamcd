
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { useRestaurantUpdate } from '@/hooks/useRestaurantUpdate';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import RestaurantHeader from '@/components/restaurant/RestaurantHeader';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import EmptyRestaurantsState from '@/components/restaurant/EmptyRestaurantsState';

const RestaurantManagementPage = () => {
  const { user, franchisee } = useAuth();
  const { restaurants, refetch } = useFranchiseeRestaurants();
  const { updateRestaurant, isUpdating } = useRestaurantUpdate();
  const [editingRestaurant, setEditingRestaurant] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleEdit = (restaurant: any) => {
    setEditingRestaurant(restaurant.id);
    setEditData({
      monthly_rent: restaurant.monthly_rent || 0,
      last_year_revenue: restaurant.last_year_revenue || 0,
      franchise_fee_percentage: restaurant.franchise_fee_percentage || 4.0,
      advertising_fee_percentage: restaurant.advertising_fee_percentage || 4.0,
      notes: restaurant.notes || ''
    });
  };

  const handleSave = async (restaurantId: string) => {
    const success = await updateRestaurant(restaurantId, editData);
    
    if (success) {
      setEditingRestaurant(null);
      setEditData({});
      // Refrescar los datos
      refetch();
    }
  };

  const handleCancel = () => {
    setEditingRestaurant(null);
    setEditData({});
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return value.toLocaleString('es-ES');
  };

  if (!user || !franchisee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
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
                Administra la información de tus restaurantes
              </p>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <RestaurantHeader 
                franchiseeName={franchisee.franchisee_name}
                restaurantCount={restaurants.length}
              />

              <div className="grid gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    editingRestaurant={editingRestaurant}
                    editData={editData}
                    setEditData={setEditData}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    formatNumber={formatNumber}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>

              {restaurants.length === 0 && <EmptyRestaurantsState />}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RestaurantManagementPage;

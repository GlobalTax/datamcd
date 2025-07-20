
import React, { useState } from 'react';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { useRestaurantUpdate } from '@/hooks/useRestaurantUpdate';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import RestaurantHeader from '@/components/restaurant/RestaurantHeader';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import EmptyRestaurantsState from '@/components/restaurant/EmptyRestaurantsState';
import { Badge } from '@/components/ui/badge';

const RestaurantManagementPage = () => {
  const { 
    restaurants, 
    loading, 
    refetch, 
    canViewAllRestaurants, 
    user, 
    franchisee 
  } = useRestaurantManagement();
  
  const { updateRestaurant, isUpdating } = useRestaurantUpdate();
  const [editingRestaurant, setEditingRestaurant] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  console.log('RestaurantManagementPage - User:', user ? { id: user.id, role: user.role } : null);
  console.log('RestaurantManagementPage - Can view all restaurants:', canViewAllRestaurants);
  console.log('RestaurantManagementPage - Restaurants:', restaurants.length);

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

  // Permitir acceso a admin, superadmin y franchisee
  if (!['franchisee', 'admin', 'superadmin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Acceso no autorizado.</p>
        </div>
      </div>
    );
  }

  // Para franchisees, verificar que tengan datos de franquiciado
  if (user.role === 'franchisee' && !franchisee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del franquiciado...</p>
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
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {canViewAllRestaurants ? 'Gestión Global de Restaurantes' : 'Gestión de Restaurantes'}
                </h1>
                <p className="text-sm text-gray-500">
                  {canViewAllRestaurants 
                    ? 'Vista completa de todos los restaurantes del sistema'
                    : 'Administra la información de tus restaurantes'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canViewAllRestaurants && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Vista {user.role === 'superadmin' ? 'Superadmin' : 'Admin'}
                  </Badge>
                )}
                <Badge variant="secondary">
                  {restaurants.length} restaurantes
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <RestaurantHeader 
                franchiseeName={
                  canViewAllRestaurants 
                    ? 'Sistema Global McDonald\'s' 
                    : (franchisee?.franchisee_name || 'Franquiciado')
                }
                restaurantCount={restaurants.length}
              />

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando restaurantes...</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {restaurants.map((restaurant) => (
                    <div key={restaurant.id} className="relative">
                      {canViewAllRestaurants && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            {(restaurant as any).franchisee_display_name}
                          </Badge>
                        </div>
                      )}
                      <RestaurantCard
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
                    </div>
                  ))}
                  
                  {restaurants.length === 0 && <EmptyRestaurantsState />}
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RestaurantManagementPage;

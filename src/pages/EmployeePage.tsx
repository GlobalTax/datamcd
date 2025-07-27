import React, { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmployeeManagement } from '@/components/employees/EmployeeManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const EmployeePage = () => {
  const { user, restaurants } = useUnifiedAuth();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
    restaurants?.[0]?.id || ''
  );

  const selectedRestaurant = restaurants?.find(r => r.id === selectedRestaurantId);

  if (!user || !restaurants) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600 rounded-xl animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">Gestión de Empleados</h1>
                <p className="text-sm text-gray-500">Administración del personal de restaurantes</p>
              </div>
            </header>
            <main className="flex-1 p-6">
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay restaurantes disponibles
                  </h3>
                  <p className="text-gray-600">
                    Necesitas tener al menos un restaurante para gestionar empleados.
                  </p>
                </CardContent>
              </Card>
            </main>
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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Gestión de Empleados</h1>
              <p className="text-sm text-gray-500">
                {selectedRestaurant 
                  ? `${selectedRestaurant.restaurant_name || 'Restaurante'} - #${selectedRestaurant.site_number}`
                  : 'Administración del personal de restaurantes'
                }
              </p>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div></div>
              {restaurants.length > 1 && (
                <Select
                  value={selectedRestaurantId}
                  onValueChange={setSelectedRestaurantId}
                >
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Seleccionar restaurante" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant: any) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.restaurant_name || `Restaurante ${restaurant.site_number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedRestaurant && (
              <EmployeeManagement
                restaurantId={selectedRestaurantId}
                restaurantName={
                  selectedRestaurant.restaurant_name || 
                  `Restaurante ${selectedRestaurant.site_number}`
                }
              />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default EmployeePage;
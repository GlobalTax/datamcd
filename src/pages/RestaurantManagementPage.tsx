
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, MapPin, Calendar, Edit, Save, X, Euro } from 'lucide-react';
import { toast } from 'sonner';

const RestaurantManagementPage = () => {
  const { user, franchisee } = useAuth();
  const { restaurants } = useFranchiseeRestaurants();
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
    try {
      // Aquí iría la llamada a la API para guardar los cambios
      console.log('Guardando cambios para restaurante:', restaurantId, editData);
      
      toast.success('Datos del restaurante actualizados correctamente');
      setEditingRestaurant(null);
      setEditData({});
    } catch (error) {
      toast.error('Error al actualizar los datos del restaurante');
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
              {/* Header Info */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-6 h-6 text-red-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{franchisee.franchisee_name}</h2>
                    <p className="text-gray-600">{restaurants.length} restaurantes asignados</p>
                  </div>
                </div>
              </div>

              {/* Restaurants List */}
              <div className="grid gap-6">
                {restaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {restaurant.base_restaurant?.restaurant_name || 'Restaurante'}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="w-4 h-4" />
                              <span>
                                Site: {restaurant.base_restaurant?.site_number} • 
                                {restaurant.base_restaurant?.city}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {editingRestaurant === restaurant.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(restaurant.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(restaurant)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Información fija */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Información General</h4>
                          
                          <div>
                            <Label className="text-sm text-gray-600">Dirección</Label>
                            <p className="text-sm font-medium">
                              {restaurant.base_restaurant?.address}
                            </p>
                          </div>
                          
                          <div>
                            <Label className="text-sm text-gray-600">Tipo de Restaurante</Label>
                            <p className="text-sm font-medium capitalize">
                              {restaurant.base_restaurant?.restaurant_type || 'Traditional'}
                            </p>
                          </div>

                          {restaurant.franchise_start_date && (
                            <div>
                              <Label className="text-sm text-gray-600">Inicio de Franquicia</Label>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <p className="text-sm font-medium">
                                  {new Date(restaurant.franchise_start_date).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Datos financieros editables */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Datos Financieros</h4>
                          
                          <div>
                            <Label className="text-sm text-gray-600">Renta Mensual (€)</Label>
                            {editingRestaurant === restaurant.id ? (
                              <Input
                                type="number"
                                value={editData.monthly_rent}
                                onChange={(e) => setEditData(prev => ({ 
                                  ...prev, 
                                  monthly_rent: Number(e.target.value) 
                                }))}
                                className="mt-1"
                              />
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <Euro className="w-4 h-4 text-green-600" />
                                <p className="text-sm font-medium">
                                  {formatNumber(restaurant.monthly_rent)}
                                </p>
                              </div>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm text-gray-600">Facturación Último Año (€)</Label>
                            {editingRestaurant === restaurant.id ? (
                              <Input
                                type="number"
                                value={editData.last_year_revenue}
                                onChange={(e) => setEditData(prev => ({ 
                                  ...prev, 
                                  last_year_revenue: Number(e.target.value) 
                                }))}
                                className="mt-1"
                              />
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <Euro className="w-4 h-4 text-green-600" />
                                <p className="text-sm font-medium">
                                  {formatNumber(restaurant.last_year_revenue)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tarifas y notas */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Tarifas y Notas</h4>
                          
                          <div>
                            <Label className="text-sm text-gray-600">Tarifa de Franquicia (%)</Label>
                            {editingRestaurant === restaurant.id ? (
                              <Input
                                type="number"
                                step="0.1"
                                value={editData.franchise_fee_percentage}
                                onChange={(e) => setEditData(prev => ({ 
                                  ...prev, 
                                  franchise_fee_percentage: Number(e.target.value) 
                                }))}
                                className="mt-1"
                              />
                            ) : (
                              <p className="text-sm font-medium mt-1">
                                {restaurant.franchise_fee_percentage || 4.0}%
                              </p>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm text-gray-600">Tarifa de Publicidad (%)</Label>
                            {editingRestaurant === restaurant.id ? (
                              <Input
                                type="number"
                                step="0.1"
                                value={editData.advertising_fee_percentage}
                                onChange={(e) => setEditData(prev => ({ 
                                  ...prev, 
                                  advertising_fee_percentage: Number(e.target.value) 
                                }))}
                                className="mt-1"
                              />
                            ) : (
                              <p className="text-sm font-medium mt-1">
                                {restaurant.advertising_fee_percentage || 4.0}%
                              </p>
                            )}
                          </div>

                          <div>
                            <Label className="text-sm text-gray-600">Notas</Label>
                            {editingRestaurant === restaurant.id ? (
                              <Textarea
                                value={editData.notes}
                                onChange={(e) => setEditData(prev => ({ 
                                  ...prev, 
                                  notes: e.target.value 
                                }))}
                                className="mt-1"
                                rows={3}
                                placeholder="Añadir notas sobre el restaurante..."
                              />
                            ) : (
                              <p className="text-sm mt-1 text-gray-600">
                                {restaurant.notes || 'Sin notas'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {restaurants.length === 0 && (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay restaurantes asignados
                  </h3>
                  <p className="text-gray-600">
                    Contacta con tu asesor para que te asigne restaurantes.
                  </p>
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

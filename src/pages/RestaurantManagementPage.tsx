
import React, { useState } from 'react';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { useRestaurantUpdate } from '@/hooks/useRestaurantUpdate';
import { useFranchiseeContext } from '@/contexts/FranchiseeContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, Grid, Download, Settings, AlertCircle, RefreshCw } from 'lucide-react';
import RestaurantTable from '@/components/restaurant/RestaurantTable';
import RestaurantMetrics from '@/components/restaurant/RestaurantMetrics';
import RestaurantFilters from '@/components/restaurant/RestaurantFilters';
import RestaurantEditModal from '@/components/restaurant/RestaurantEditModal';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

const RestaurantManagementPage = () => {
  const { selectedFranchisee } = useFranchiseeContext();
  const { 
    restaurants, 
    loading, 
    error,
    refetch, 
    canViewAllRestaurants,
    hasValidAccess,
    needsFranchiseeData,
    user, 
    franchisee 
  } = useRestaurantManagement();
  
  const { updateRestaurant, isUpdating } = useRestaurantUpdate();
  
  const [filteredRestaurants, setFilteredRestaurants] = useState<FranchiseeRestaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<FranchiseeRestaurant | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Usar restaurants filtrados o todos si no hay filtros
  const displayRestaurants = filteredRestaurants.length > 0 ? 
    filteredRestaurants : restaurants;

  const handleEdit = (restaurant: FranchiseeRestaurant) => {
    setSelectedRestaurant(restaurant);
    setIsEditModalOpen(true);
  };

  const handleView = (restaurant: FranchiseeRestaurant) => {
    handleEdit(restaurant);
  };

  const handleSave = async (restaurantId: string, editData: any) => {
    const success = await updateRestaurant(restaurantId, editData);
    
    if (success) {
      refetch();
      return true;
    }
    return false;
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedRestaurant(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    const csvContent = displayRestaurants.map(restaurant => ({
      'Sitio': restaurant.base_restaurant?.site_number || '',
      'Nombre': restaurant.base_restaurant?.restaurant_name || '',
      'Ciudad': restaurant.base_restaurant?.city || '',
      'Estado': restaurant.status || '',
      'Renta Mensual': restaurant.monthly_rent || 0,
      'Ingresos Anuales': restaurant.last_year_revenue || 0,
      'Franquiciado': canViewAllRestaurants ? (restaurant as any).franchisee_display_name || '' : ''
    }));

    const headers = Object.keys(csvContent[0] || {});
    const csvString = [
      headers.join(','),
      ...csvContent.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `restaurantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return value.toLocaleString('es-ES');
  };

  // Estado de carga inicial
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

  // Verificar acceso autorizado
  if (!hasValidAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Acceso no autorizado</h2>
          <p className="text-gray-600 mb-4">
            {needsFranchiseeData 
              ? 'No se encontraron datos de franquiciado para tu cuenta. Contacta al administrador.'
              : 'No tienes permisos para acceder a esta sección.'
            }
          </p>
          <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
            Volver al Dashboard
          </Button>
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
                    ? `Vista de restaurantes${selectedFranchisee ? ` - ${selectedFranchisee.franchisee_name}` : ''}`
                    : 'Administra la información de tus restaurantes'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canViewAllRestaurants && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Vista {user.role === 'superadmin' ? 'Superadmin' : user.role === 'admin' ? 'Admin' : 'Asesor'}
                  </Badge>
                )}
                <Badge variant="secondary">
                  {displayRestaurants.length} de {restaurants.length} restaurantes
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2" 
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando restaurantes...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Métricas */}
                <RestaurantMetrics 
                  restaurants={displayRestaurants}
                  canViewAllRestaurants={canViewAllRestaurants}
                />

                {/* Filtros y controles */}
                <div className="flex items-center justify-between">
                  <RestaurantFilters
                    restaurants={restaurants}
                    canViewAllRestaurants={canViewAllRestaurants}
                    onFiltersChange={setFilteredRestaurants}
                  />
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                    
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="h-8"
                      >
                        <Table className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'cards' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                        className="h-8"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Contenido principal */}
                {viewMode === 'table' ? (
                  <RestaurantTable
                    restaurants={displayRestaurants}
                    canViewAllRestaurants={canViewAllRestaurants}
                    onEdit={handleEdit}
                    onView={handleView}
                    loading={false}
                  />
                ) : (
                  <div className="grid gap-6">
                    {displayRestaurants.map((restaurant) => (
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
                          editingRestaurant={null}
                          editData={{}}
                          setEditData={() => {}}
                          onEdit={handleEdit}
                          onSave={() => Promise.resolve()}
                          onCancel={() => {}}
                          formatNumber={formatNumber}
                          isUpdating={false}
                        />
                      </div>
                    ))}
                    
                    {displayRestaurants.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No se encontraron restaurantes con los filtros aplicados.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      {/* Modal de edición */}
      <RestaurantEditModal
        restaurant={selectedRestaurant}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        isUpdating={isUpdating}
      />
    </SidebarProvider>
  );
};

export default RestaurantManagementPage;

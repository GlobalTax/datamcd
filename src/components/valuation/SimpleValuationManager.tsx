import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { useAuth } from '@/hooks/useAuth';
import { useValuationManager } from '@/hooks/useValuationManager';
import { Building2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import RestaurantSelectorCard from './RestaurantSelectorCard';
import ValuationActions from './ValuationActions';
import ValuationStatusCard from './ValuationStatusCard';
import SaveValuationDialog from './SaveValuationDialog';
import LoadValuationDialog from './LoadValuationDialog';

interface SimpleValuationManagerProps {
  onRestaurantSelected: (restaurantId: string, restaurantName: string) => void;
  onValuationLoaded: (valuation: any) => void;
  currentData: any;
}

const SimpleValuationManager = ({ 
  onRestaurantSelected, 
  onValuationLoaded, 
  currentData 
}: SimpleValuationManagerProps) => {
  const { user, franchisee } = useAuth();
  const { restaurants, loading, error, refetch } = useFranchiseeRestaurants();
  const {
    selectedRestaurantId,
    setSelectedRestaurantId,
    selectedRestaurantName,
    setSelectedRestaurantName,
    valuationName,
    setValuationName,
    currentValuationId,
    handleSaveValuation,
    handleLoadValuation,
    getRestaurantValuations
  } = useValuationManager();
  
  const [isNewValuationOpen, setIsNewValuationOpen] = useState(false);
  const [isLoadValuationOpen, setIsLoadValuationOpen] = useState(false);

  console.log('SimpleValuationManager - User:', user);
  console.log('SimpleValuationManager - Franchisee:', franchisee);
  console.log('SimpleValuationManager - Restaurants:', restaurants);
  console.log('SimpleValuationManager - Loading:', loading);
  console.log('SimpleValuationManager - Error:', error);

  // Si el franchisee es temporal, mostrar mensaje especial
  const isTemporaryFranchisee = franchisee?.id?.startsWith('temp-');

  const restaurantOptions = restaurants
    .filter(r => r.base_restaurant)
    .map(r => ({
      id: r.base_restaurant!.id,
      name: r.base_restaurant!.restaurant_name,
      site_number: r.base_restaurant!.site_number
    }));

  console.log('Restaurant options:', restaurantOptions);

  const handleRestaurantChange = (restaurantId: string) => {
    const restaurant = restaurantOptions.find(r => r.id === restaurantId);
    if (restaurant) {
      console.log('Restaurant selected:', restaurant);
      setSelectedRestaurantId(restaurantId);
      setSelectedRestaurantName(restaurant.name);
      onRestaurantSelected(restaurantId, restaurant.name);
      toast.success(`Restaurante seleccionado: ${restaurant.name}`);
    }
  };

  const onSaveValuation = async () => {
    await handleSaveValuation(currentData);
    setIsNewValuationOpen(false);
  };

  const onLoadValuation = (valuation: any) => {
    handleLoadValuation(valuation, onValuationLoaded);
    onRestaurantSelected(valuation.restaurant_id, valuation.restaurant_name);
    setIsLoadValuationOpen(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Cargando restaurantes...</p>
        </CardContent>
      </Card>
    );
  }

  if (isTemporaryFranchisee) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-orange-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Datos temporales
          </h3>
          <p className="text-gray-600 mb-4">
            No se pudo conectar con la base de datos. Trabajando con datos temporales.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Para acceder a tus restaurantes reales, verifica tu conexión a Internet y recarga la página.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Recargar página
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (restaurants.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay restaurantes disponibles
          </h3>
          <p className="text-gray-600 mb-4">
            No tienes restaurantes asignados para realizar valoraciones.
          </p>
          <Button onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Buscar restaurantes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Gestión de Valoraciones
          </CardTitle>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RestaurantSelectorCard
          restaurants={restaurantOptions}
          selectedRestaurantId={selectedRestaurantId}
          onRestaurantChange={handleRestaurantChange}
          onRefresh={refetch}
        />

        <ValuationActions
          selectedRestaurantId={selectedRestaurantId}
          onSaveClick={() => setIsNewValuationOpen(true)}
          onLoadClick={() => setIsLoadValuationOpen(true)}
          currentValuationId={currentValuationId}
        />

        <ValuationStatusCard
          selectedRestaurantId={selectedRestaurantId}
          selectedRestaurantName={selectedRestaurantName}
          currentValuationId={currentValuationId}
        />

        <SaveValuationDialog
          isOpen={isNewValuationOpen}
          onOpenChange={setIsNewValuationOpen}
          valuationName={valuationName}
          onValuationNameChange={setValuationName}
          onSave={onSaveValuation}
          currentValuationId={currentValuationId}
        />

        <LoadValuationDialog
          isOpen={isLoadValuationOpen}
          onOpenChange={setIsLoadValuationOpen}
          valuations={getRestaurantValuations()}
          onLoadValuation={onLoadValuation}
        />
      </CardContent>
    </Card>
  );
};

export default SimpleValuationManager;

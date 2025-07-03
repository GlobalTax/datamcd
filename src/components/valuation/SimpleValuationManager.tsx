
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useValuationManager } from '@/hooks/useValuationManager';
import { Building2, RefreshCw, Zap } from 'lucide-react';
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
  const { user, franchisee, restaurants, loading, isUsingCache } = useFastAuth();
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

  console.log('SimpleValuationManager - Fast auth data:', {
    user: user ? { id: user.id, role: user.role } : null,
    franchisee: franchisee ? { id: franchisee.id, name: franchisee.franchisee_name } : null,
    restaurantsCount: restaurants?.length || 0,
    loading,
    isUsingCache
  });

  const restaurantOptions = restaurants
    .filter(r => r.base_restaurant)
    .map(r => ({
      id: r.base_restaurant!.id,
      name: r.base_restaurant!.restaurant_name,
      site_number: r.base_restaurant!.site_number
    }));

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
          <p>Cargando datos rápidos...</p>
        </CardContent>
      </Card>
    );
  }

  if (restaurantOptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Datos predefinidos disponibles
          </h3>
          <p className="text-gray-600 mb-4">
            {isUsingCache 
              ? 'Usando datos predefinidos para carga rápida. Los restaurantes están disponibles para valoración.'
              : 'No hay restaurantes asignados para realizar valoraciones.'
            }
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Recargar datos
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
            {isUsingCache && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                <Zap className="w-3 h-3" />
                <span>Carga rápida</span>
              </div>
            )}
          </CardTitle>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
        {isUsingCache && (
          <p className="text-sm text-blue-600">
            Usando datos predefinidos para experiencia rápida. Recarga para sincronizar.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <RestaurantSelectorCard
          restaurants={restaurantOptions}
          selectedRestaurantId={selectedRestaurantId}
          onRestaurantChange={handleRestaurantChange}
          onRefresh={() => window.location.reload()}
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

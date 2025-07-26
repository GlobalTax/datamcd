
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRestaurants } from '@/hooks/data/useRestaurants';
import { useValuationManager } from '@/hooks/useValuationManager';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { Building2, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import RestaurantSelectorCard from './RestaurantSelectorCard';
import ValuationActions from './ValuationActions';
import ValuationStatusCard from './ValuationStatusCard';
import SaveValuationDialog from './SaveValuationDialog';
import LoadValuationDialog from './LoadValuationDialog';
import { logger } from '@/lib/logger';
import { Restaurant } from '@/types/restaurant';

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
  const { user: authUser, franchisee, restaurants: franchiseeRestaurants, loading: fastAuthLoading } = useAuth();
  const { restaurants: allRestaurants, isLoading: unifiedLoading } = useRestaurants();
  
  // Use unified restaurants for admin/superadmin, fast auth for franchisees
  const isAdmin = authUser?.role === 'admin' || authUser?.role === 'superadmin';
  const restaurants = isAdmin ? allRestaurants : franchiseeRestaurants;
  const loading = isAdmin ? unifiedLoading : fastAuthLoading;
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

  logger.debug('SimpleValuationManager restaurant data', {
    userRole: authUser?.role,
    franchiseeId: franchisee?.id,
    restaurantsCount: restaurants.length
  });

  const handleRestaurantSelect = (restaurant: any) => {
    setSelectedRestaurantId(restaurant.id);
    setSelectedRestaurantName(restaurant.name || restaurant.restaurant_name || 'Sin nombre');
    logger.debug('Restaurant selected', { restaurantId: restaurant.id, name: restaurant.name });
    
    onRestaurantSelected(restaurant.id, restaurant.name || restaurant.restaurant_name || 'Sin nombre');
    toast.success(`Restaurante seleccionado: ${restaurant.name || restaurant.restaurant_name}`);
  };

  const restaurantOptions = restaurants.map(r => ({
    id: r.id,
    name: (r as any).name || (r as any).restaurant_name || 'Sin nombre',
    location: (r as any).location || 'Sin ubicación',
    site_number: (r as any).site_number || 'N/A'
  }));

  const handleRestaurantChange = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      handleRestaurantSelect(restaurant);
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
            No hay restaurantes asignados para realizar valoraciones.
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
          </CardTitle>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
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

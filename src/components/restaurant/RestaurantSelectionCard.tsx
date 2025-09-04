import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchableRestaurantSelect } from '@/components/ui/searchable-restaurant-select';
import { useUserRestaurants } from '@/hooks/useUnifiedRestaurants';
import { useRestaurantContext } from '@/providers/RestaurantContext';
import { useUnifiedAuth } from '@/contexts/auth';
import { Building2, ArrowRight } from 'lucide-react';
import { LoadingFallback } from '@/components/common/LoadingFallback';

export const RestaurantSelectionCard: React.FC = () => {
  const { user } = useUnifiedAuth();
  const { setRestaurantId } = useRestaurantContext();
  const { data: restaurants = [], isLoading, error } = useUserRestaurants();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');

  console.log('🏪 RestaurantSelectionCard: Rendering with data:', {
    user: user?.id,
    restaurantsCount: restaurants.length,
    isLoading,
    error,
    restaurants
  });

  const handleRestaurantSelect = () => {
    if (selectedRestaurantId) {
      console.log('🏪 RestaurantSelectionCard: Selecting restaurant:', selectedRestaurantId);
      setRestaurantId(selectedRestaurantId);
    }
  };

  if (isLoading) {
    console.log('🏪 RestaurantSelectionCard: Still loading...');
    return <LoadingFallback />;
  }

  if (error) {
    console.error('🏪 RestaurantSelectionCard: Error loading restaurants:', error);
  }

  const restaurantOptions = restaurants.map(restaurant => ({
    value: restaurant.restaurant_id,
    id: restaurant.restaurant_id,
    name: restaurant.restaurant_name,
    site_number: restaurant.site_number,
    label: `${restaurant.restaurant_name} (${restaurant.site_number})`,
    siteNumber: restaurant.site_number,
    location: 'Sin ubicación'
  }));

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>Seleccionar Restaurante</CardTitle>
        <CardDescription>
          {restaurants.length > 0 
            ? `Selecciona uno de tus ${restaurants.length} restaurantes para continuar`
            : 'No tienes restaurantes asignados'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {restaurants.length > 0 ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Restaurante
              </label>
              <SearchableRestaurantSelect
                restaurants={restaurantOptions}
                value={selectedRestaurantId}
                onValueChange={setSelectedRestaurantId}
                placeholder="Buscar restaurante..."
                compact
              />
            </div>
            
            <Button 
              onClick={handleRestaurantSelect}
              disabled={!selectedRestaurantId}
              className="w-full"
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Contacta con tu administrador para que te asigne acceso a un restaurante.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Recargar página
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
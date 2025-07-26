
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableRestaurantSelect, RestaurantOption } from '@/components/ui/searchable-restaurant-select';
import { Building2 } from 'lucide-react';


interface RestaurantSelectorProps {
  restaurants: RestaurantOption[];
  selectedRestaurant: RestaurantOption | null;
  onRestaurantChange: (restaurant: RestaurantOption) => void;
  loading?: boolean;
}

const RestaurantSelector = ({ 
  restaurants, 
  selectedRestaurant, 
  onRestaurantChange, 
  loading = false 
}: RestaurantSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Seleccionar Restaurante para Valorar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SearchableRestaurantSelect
          restaurants={restaurants}
          value={selectedRestaurant?.id || ''}
          onValueChange={(value) => {
            const restaurant = restaurants.find(r => r.id === value);
            if (restaurant) {
              onRestaurantChange(restaurant);
            }
          }}
          placeholder="Selecciona un restaurante para valorar..."
          loading={loading}
          disabled={loading}
          compact
        />
        
        {selectedRestaurant && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800">Restaurante Seleccionado:</h4>
            <p className="text-green-700">{selectedRestaurant.name}</p>
            <p className="text-sm text-green-600">Número de sitio: #{selectedRestaurant.site_number}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RestaurantSelector;

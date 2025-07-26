
import React from 'react';
import { SearchableRestaurantSelect, RestaurantOption } from '@/components/ui/searchable-restaurant-select';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface RestaurantSelectorCardProps {
  restaurants: RestaurantOption[];
  selectedRestaurantId: string;
  onRestaurantChange: (restaurantId: string) => void;
  onRefresh: () => void;
}

const RestaurantSelectorCard = ({
  restaurants,
  selectedRestaurantId,
  onRestaurantChange,
  onRefresh
}: RestaurantSelectorCardProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">
          Seleccionar Restaurante ({restaurants.length} disponibles)
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <SearchableRestaurantSelect
        restaurants={restaurants}
        value={selectedRestaurantId}
        onValueChange={onRestaurantChange}
        placeholder="Selecciona un restaurante..."
        compact
      />
    </div>
  );
};

export default RestaurantSelectorCard;

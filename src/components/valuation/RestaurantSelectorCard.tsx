
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, RefreshCw } from 'lucide-react';

interface RestaurantOption {
  id: string;
  name: string;
  site_number: string;
  franchisee_name?: string;
}

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
    <div>
      <label className="block text-sm font-medium mb-2">
        Seleccionar Restaurante ({restaurants.length} disponibles)
      </label>
      <Select value={selectedRestaurantId} onValueChange={onRestaurantChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un restaurante..." />
        </SelectTrigger>
        <SelectContent>
          {restaurants.map((restaurant) => (
            <SelectItem key={restaurant.id} value={restaurant.id}>
              <div className="flex flex-col">
                <span className="font-medium">{restaurant.name}</span>
                <div className="flex gap-2 text-sm text-gray-500">
                  <span>#{restaurant.site_number}</span>
                  {restaurant.franchisee_name && (
                    <span>• {restaurant.franchisee_name}</span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RestaurantSelectorCard;

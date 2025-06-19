
import React from 'react';
import { Building } from 'lucide-react';

interface RestaurantHeaderProps {
  franchiseeName: string;
  restaurantCount: number;
}

const RestaurantHeader = ({ franchiseeName, restaurantCount }: RestaurantHeaderProps) => {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Building className="w-6 h-6 text-red-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{franchiseeName}</h2>
          <p className="text-gray-600">{restaurantCount} restaurantes asignados</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHeader;

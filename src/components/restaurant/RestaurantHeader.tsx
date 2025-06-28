
import React from 'react';
import { Building } from 'lucide-react';

interface RestaurantHeaderProps {
  franchiseeName: string;
  restaurantCount: number;
}

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({
  franchiseeName,
  restaurantCount
}) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-red-100 p-3 rounded-lg">
          <Building className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {franchiseeName}
          </h2>
          <p className="text-gray-600">
            {restaurantCount === 0 
              ? 'No hay restaurantes asignados'
              : `${restaurantCount} restaurante${restaurantCount !== 1 ? 's' : ''} asignado${restaurantCount !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      </div>
      
      {restaurantCount > 0 && (
        <div className="text-sm text-gray-500">
          Gestiona la información financiera y operativa de tus restaurantes
        </div>
      )}
    </div>
  );
};

export default RestaurantHeader;


import React from 'react';
import { Building } from 'lucide-react';

const EmptyRestaurantsState = () => {
  return (
    <div className="text-center py-12">
      <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay restaurantes asignados
      </h3>
      <p className="text-gray-600">
        Contacta con tu asesor para que te asigne restaurantes.
      </p>
    </div>
  );
};

export default EmptyRestaurantsState;

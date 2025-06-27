
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Euro, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FranchiseeRestaurantsTableProps {
  franchiseeId: string;
  restaurants: any[];
}

export const FranchiseeRestaurantsTable: React.FC<FranchiseeRestaurantsTableProps> = ({
  franchiseeId,
  restaurants
}) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number | null | undefined): string => {
    if (!amount || isNaN(amount)) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewRestaurant = (restaurant: any) => {
    const restaurantId = restaurant.base_restaurant?.id || restaurant.id;
    navigate(`/restaurant/${restaurantId}`);
  };

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay restaurantes asignados
        </h3>
        <p className="text-gray-600">
          Contacta con tu asesor para la asignación de restaurantes.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Restaurante</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Ubicación</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Facturación</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Renta</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((restaurant) => {
            const baseRestaurant = restaurant.base_restaurant || restaurant;
            return (
              <tr key={restaurant.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {baseRestaurant.restaurant_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{baseRestaurant.site_number}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <div>
                      <div>{baseRestaurant.city}</div>
                      <div className="text-xs text-gray-500">{baseRestaurant.address}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {baseRestaurant.restaurant_type || 'traditional'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Euro className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">
                      {formatCurrency(restaurant.last_year_revenue)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Año anterior</div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Euro className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {formatCurrency(restaurant.monthly_rent)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Mensual</div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    restaurant.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {restaurant.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewRestaurant(restaurant)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

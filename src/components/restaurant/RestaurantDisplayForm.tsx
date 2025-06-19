
import React from 'react';
import { Label } from '@/components/ui/label';
import { Euro, Calendar } from 'lucide-react';

interface RestaurantDisplayFormProps {
  restaurant: any;
  formatNumber: (value: number | undefined | null) => string;
}

const RestaurantDisplayForm = ({ restaurant, formatNumber }: RestaurantDisplayFormProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Información fija */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Información General</h4>
        
        <div>
          <Label className="text-sm text-gray-600">Dirección</Label>
          <p className="text-sm font-medium">
            {restaurant.base_restaurant?.address}
          </p>
        </div>
        
        <div>
          <Label className="text-sm text-gray-600">Tipo de Restaurante</Label>
          <p className="text-sm font-medium capitalize">
            {restaurant.base_restaurant?.restaurant_type || 'Traditional'}
          </p>
        </div>

        {restaurant.franchise_start_date && (
          <div>
            <Label className="text-sm text-gray-600">Inicio de Franquicia</Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium">
                {new Date(restaurant.franchise_start_date).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Datos financieros */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Datos Financieros</h4>
        
        <div>
          <Label className="text-sm text-gray-600">Renta Mensual (€)</Label>
          <div className="flex items-center gap-2 mt-1">
            <Euro className="w-4 h-4 text-green-600" />
            <p className="text-sm font-medium">
              {formatNumber(restaurant.monthly_rent)}
            </p>
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Facturación Último Año (€)</Label>
          <div className="flex items-center gap-2 mt-1">
            <Euro className="w-4 h-4 text-green-600" />
            <p className="text-sm font-medium">
              {formatNumber(restaurant.last_year_revenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Tarifas y notas */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Tarifas y Notas</h4>
        
        <div>
          <Label className="text-sm text-gray-600">Tarifa de Franquicia (%)</Label>
          <p className="text-sm font-medium mt-1">
            {restaurant.franchise_fee_percentage || 4.0}%
          </p>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Tarifa de Publicidad (%)</Label>
          <p className="text-sm font-medium mt-1">
            {restaurant.advertising_fee_percentage || 4.0}%
          </p>
        </div>

        <div>
          <Label className="text-sm text-gray-600">Notas</Label>
          <p className="text-sm mt-1 text-gray-600">
            {restaurant.notes || 'Sin notas'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDisplayForm;

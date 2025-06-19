
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, MapPin, Edit, Save, X, Loader2 } from 'lucide-react';
import RestaurantEditForm from './RestaurantEditForm';
import RestaurantDisplayForm from './RestaurantDisplayForm';

interface RestaurantCardProps {
  restaurant: any;
  editingRestaurant: string | null;
  editData: any;
  setEditData: React.Dispatch<React.SetStateAction<any>>;
  onEdit: (restaurant: any) => void;
  onSave: (restaurantId: string) => void;
  onCancel: () => void;
  formatNumber: (value: number | undefined | null) => string;
  isUpdating?: boolean;
}

const RestaurantCard = ({
  restaurant,
  editingRestaurant,
  editData,
  setEditData,
  onEdit,
  onSave,
  onCancel,
  formatNumber,
  isUpdating = false
}: RestaurantCardProps) => {
  const isEditing = editingRestaurant === restaurant.id;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {restaurant.base_restaurant?.restaurant_name || 'Restaurante'}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>
                  Site: {restaurant.base_restaurant?.site_number} • 
                  {restaurant.base_restaurant?.city}
                </span>
              </div>
            </div>
          </div>
          
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onSave(restaurant.id)}
                className="bg-green-600 hover:bg-green-700"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                disabled={isUpdating}
              >
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(restaurant)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isEditing ? (
          <RestaurantEditForm
            editData={editData}
            setEditData={setEditData}
            restaurant={restaurant}
            formatNumber={formatNumber}
          />
        ) : (
          <RestaurantDisplayForm
            restaurant={restaurant}
            formatNumber={formatNumber}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;

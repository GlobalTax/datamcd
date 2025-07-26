
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Hash, Euro, Calendar, Edit, Save, X } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: any;
  editingRestaurant: string | null;
  editData: any;
  setEditData: (data: any) => void;
  onEdit: (restaurant: any) => void;
  onSave: (restaurantId: string) => void;
  onCancel: () => void;
  formatNumber: (value: number | undefined | null) => string;
  isUpdating: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  editingRestaurant,
  editData,
  setEditData,
  onEdit,
  onSave,
  onCancel,
  formatNumber,
  isUpdating
}) => {
  const isEditing = editingRestaurant === restaurant.id;
  const baseRestaurant = restaurant.base_restaurant;

  if (!baseRestaurant) {
    logger.warn('Restaurant without base_restaurant data', { restaurantId: restaurant.id });
    return null;
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>{baseRestaurant.restaurant_name}</span>
              <Badge variant="outline" className="text-xs">
                #{baseRestaurant.site_number}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{baseRestaurant.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                <span>{baseRestaurant.restaurant_type === 'traditional' ? 'Tradicional' : 
                       baseRestaurant.restaurant_type === 'drive_thru' ? 'Drive Thru' : 
                       baseRestaurant.restaurant_type}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-1">
              {baseRestaurant.address}
            </p>
          </div>
          
          <div className="flex gap-2">
            {!isEditing ? (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onEdit(restaurant)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => onSave(restaurant.id)}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Información de franquicia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Fechas de Franquicia</Label>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {restaurant.franchise_start_date 
                  ? new Date(restaurant.franchise_start_date).toLocaleDateString('es-ES')
                  : 'No especificada'
                } - {restaurant.franchise_end_date 
                  ? new Date(restaurant.franchise_end_date).toLocaleDateString('es-ES')
                  : 'No especificada'
                }
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Capacidad</Label>
            <div className="text-sm text-gray-600">
              {baseRestaurant.seating_capacity ? `${baseRestaurant.seating_capacity} asientos` : 'No especificada'} • 
              {baseRestaurant.square_meters ? ` ${baseRestaurant.square_meters} m²` : ' Tamaño no especificado'}
            </div>
          </div>
        </div>

        {/* Información financiera editable */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-4">Información Financiera</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`rent-${restaurant.id}`} className="text-sm font-medium">
                Renta Mensual (€)
              </Label>
              {isEditing ? (
                <Input
                  id={`rent-${restaurant.id}`}
                  type="number"
                  value={editData.monthly_rent}
                  onChange={(e) => setEditData({...editData, monthly_rent: parseFloat(e.target.value) || 0})}
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center gap-1 text-sm font-medium text-green-600 mt-1">
                  <Euro className="w-4 h-4" />
                  <span>{formatNumber(restaurant.monthly_rent)}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor={`revenue-${restaurant.id}`} className="text-sm font-medium">
                Ingresos Año Anterior (€)
              </Label>
              {isEditing ? (
                <Input
                  id={`revenue-${restaurant.id}`}
                  type="number"
                  value={editData.last_year_revenue}
                  onChange={(e) => setEditData({...editData, last_year_revenue: parseFloat(e.target.value) || 0})}
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center gap-1 text-sm font-medium text-blue-600 mt-1">
                  <Euro className="w-4 h-4" />
                  <span>{formatNumber(restaurant.last_year_revenue)}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor={`franchise-fee-${restaurant.id}`} className="text-sm font-medium">
                Fee Franquicia (%)
              </Label>
              {isEditing ? (
                <Input
                  id={`franchise-fee-${restaurant.id}`}
                  type="number"
                  step="0.1"
                  value={editData.franchise_fee_percentage}
                  onChange={(e) => setEditData({...editData, franchise_fee_percentage: parseFloat(e.target.value) || 0})}
                  className="mt-1"
                />
              ) : (
                <div className="text-sm font-medium mt-1">
                  {restaurant.franchise_fee_percentage || 4.0}%
                </div>
              )}
            </div>

            <div>
              <Label htmlFor={`advertising-fee-${restaurant.id}`} className="text-sm font-medium">
                Fee Publicidad (%)
              </Label>
              {isEditing ? (
                <Input
                  id={`advertising-fee-${restaurant.id}`}
                  type="number"
                  step="0.1"
                  value={editData.advertising_fee_percentage}
                  onChange={(e) => setEditData({...editData, advertising_fee_percentage: parseFloat(e.target.value) || 0})}
                  className="mt-1"
                />
              ) : (
                <div className="text-sm font-medium mt-1">
                  {restaurant.advertising_fee_percentage || 4.0}%
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="mt-4">
            <Label htmlFor={`notes-${restaurant.id}`} className="text-sm font-medium">
              Notas
            </Label>
            {isEditing ? (
              <Textarea
                id={`notes-${restaurant.id}`}
                value={editData.notes}
                onChange={(e) => setEditData({...editData, notes: e.target.value})}
                placeholder="Añadir notas sobre este restaurante..."
                className="mt-1"
                rows={3}
              />
            ) : (
              <div className="text-sm text-gray-600 mt-1 min-h-[60px] p-2 bg-gray-50 rounded">
                {restaurant.notes || 'Sin notas'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;

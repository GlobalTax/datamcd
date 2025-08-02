import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Building2, 
  Users, 
  Maximize,
  Home
} from 'lucide-react';

interface RestaurantGeneralTabProps {
  restaurant: any;
}

export const RestaurantGeneralTab: React.FC<RestaurantGeneralTabProps> = ({ restaurant }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Dirección</p>
            <p className="font-medium">{restaurant.base_restaurant?.address}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ciudad</p>
              <p className="font-medium">{restaurant.base_restaurant?.city}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Provincia</p>
              <p className="font-medium">{restaurant.base_restaurant?.state}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">País</p>
            <p className="font-medium">{restaurant.base_restaurant?.country}</p>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Detalles del Restaurante
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Restaurante</p>
            <Badge variant="outline" className="mt-1">
              {restaurant.base_restaurant?.restaurant_type || 'Traditional'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Propiedad</p>
            <p className="font-medium">{restaurant.base_restaurant?.property_type || 'N/A'}</p>
          </div>
          {restaurant.base_restaurant?.opening_date && (
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Apertura</p>
              <p className="font-medium">{formatDate(restaurant.base_restaurant.opening_date)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capacity Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Capacidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {restaurant.base_restaurant?.seating_capacity && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Capacidad de Asientos</p>
                <p className="font-medium">{restaurant.base_restaurant.seating_capacity} personas</p>
              </div>
            </div>
          )}
          {restaurant.base_restaurant?.square_meters && (
            <div className="flex items-center gap-2">
              <Maximize className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Superficie</p>
                <p className="font-medium">{restaurant.base_restaurant.square_meters} m²</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Information */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Información Contractual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {restaurant.franchise_start_date && (
              <div>
                <p className="text-sm text-muted-foreground">Inicio de Franquicia</p>
                <p className="font-medium text-green-600">
                  {formatDate(restaurant.franchise_start_date)}
                </p>
              </div>
            )}
            {restaurant.franchise_end_date && (
              <div>
                <p className="text-sm text-muted-foreground">Fin de Franquicia</p>
                <p className="font-medium text-orange-600">
                  {formatDate(restaurant.franchise_end_date)}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Tarifa de Franquicia</p>
              <p className="font-medium">{restaurant.franchise_fee_percentage || 4.0}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tarifa de Publicidad</p>
              <p className="font-medium">{restaurant.advertising_fee_percentage || 4.0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {restaurant.notes && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{restaurant.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
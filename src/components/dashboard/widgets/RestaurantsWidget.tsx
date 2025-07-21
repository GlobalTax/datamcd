
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Euro, Users, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFranchiseeContext } from '@/contexts/FranchiseeContext';

interface RestaurantsWidgetProps {
  restaurants: any[];
}

export const RestaurantsWidget: React.FC<RestaurantsWidgetProps> = ({ restaurants }) => {
  const navigate = useNavigate();
  const { selectedFranchisee, loading: franchiseeLoading } = useFranchiseeContext();

  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '€0';
    }
    return `€${value.toLocaleString('es-ES')}`;
  };

  const getRestaurantRevenue = (restaurant: any): number => {
    if ('assignment' in restaurant && restaurant.assignment?.last_year_revenue) {
      return restaurant.assignment.last_year_revenue;
    } else if ('last_year_revenue' in restaurant && restaurant.last_year_revenue) {
      return restaurant.last_year_revenue;
    }
    return 0;
  };

  const getRestaurantName = (restaurant: any): string => {
    return restaurant.restaurant_name || restaurant.name || 'Sin nombre';
  };

  const getRestaurantLocation = (restaurant: any): string => {
    if ('base_restaurant' in restaurant && restaurant.base_restaurant) {
      return `${restaurant.base_restaurant.city}, ${restaurant.base_restaurant.address}`;
    }
    return `${restaurant.city || 'Ciudad'}, ${restaurant.address || 'Dirección'}`;
  };

  const getSiteNumber = (restaurant: any): string => {
    if ('base_restaurant' in restaurant && restaurant.base_restaurant) {
      return restaurant.base_restaurant.site_number || 'N/A';
    }
    return restaurant.site_number || restaurant.siteNumber || 'N/A';
  };

  if (franchiseeLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Cargando Restaurantes...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (restaurants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Restaurantes
            {selectedFranchisee && (
              <Badge variant="secondary" className="ml-2">
                {selectedFranchisee.franchisee_name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Sin restaurantes asignados</h3>
            <p className="text-muted-foreground mb-4">
              {selectedFranchisee 
                ? `No se encontraron restaurantes para ${selectedFranchisee.franchisee_name}`
                : 'No hay restaurantes disponibles'
              }
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/restaurant/manage')}
            >
              Gestionar Restaurantes
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Restaurantes
            <Badge variant="secondary">{restaurants.length}</Badge>
            {selectedFranchisee && (
              <Badge variant="outline" className="ml-2">
                {selectedFranchisee.franchisee_name}
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/restaurant/manage')}
          >
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {restaurants.slice(0, 3).map((restaurant, index) => (
            <div key={restaurant.id || index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {getRestaurantName(restaurant)}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    #{getSiteNumber(restaurant)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{getRestaurantLocation(restaurant)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Euro className="w-3 h-3" />
                    <span>{formatCurrency(getRestaurantRevenue(restaurant))}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {restaurant.restaurant_type || 'tradicional'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          
          {restaurants.length > 3 && (
            <div className="text-center pt-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/restaurant/manage')}
                className="text-muted-foreground"
              >
                Ver {restaurants.length - 3} restaurantes más
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

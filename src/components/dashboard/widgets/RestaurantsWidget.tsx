
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, TrendingUp, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Restaurant {
  id: string;
  restaurant_name?: string;
  name?: string;
  city?: string;
  site_number?: string;
  last_year_revenue?: number;
  status?: string;
  restaurant_type?: string;
}

interface RestaurantsWidgetProps {
  restaurants: Restaurant[];
  maxItems?: number;
}

export const RestaurantsWidget: React.FC<RestaurantsWidgetProps> = ({ 
  restaurants, 
  maxItems = 5 
}) => {
  const navigate = useNavigate();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const topRestaurants = restaurants
    .sort((a, b) => (b.last_year_revenue || 0) - (a.last_year_revenue || 0))
    .slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Mis Restaurantes
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/restaurant')}
        >
          Ver Todos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topRestaurants.map((restaurant) => (
            <div 
              key={restaurant.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-gray-900">
                    {restaurant.restaurant_name || restaurant.name || 'Restaurante'}
                  </h4>
                  <Badge className={getStatusColor(restaurant.status)}>
                    {restaurant.status || 'active'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {restaurant.city || 'Ciudad'}
                  </span>
                  <span>#{restaurant.site_number || 'N/A'}</span>
                  {restaurant.last_year_revenue && (
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      {formatCurrency(restaurant.last_year_revenue)}
                    </span>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {restaurants.length > maxItems && (
            <div className="text-center pt-2">
              <Button 
                variant="link" 
                onClick={() => navigate('/restaurant')}
                className="text-blue-600"
              >
                Ver {restaurants.length - maxItems} restaurantes más
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

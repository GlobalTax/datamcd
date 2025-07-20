
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Calendar, Users, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RestaurantQuickManagementProps {
  restaurants: any[];
}

export const RestaurantQuickManagement: React.FC<RestaurantQuickManagementProps> = ({ restaurants }) => {
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyLevel = (restaurant: any) => {
    const franchiseEndDate = restaurant.franchise_end_date;
    if (!franchiseEndDate) return null;
    
    const endDate = new Date(franchiseEndDate);
    const now = new Date();
    const monthsUntilExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsUntilExpiry <= 6) return 'high';
    if (monthsUntilExpiry <= 12) return 'medium';
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Gestión Rápida
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/restaurant/manage')}
        >
          Ver Todos
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {restaurants.slice(0, 5).map((restaurant, index) => {
            const urgency = getUrgencyLevel(restaurant);
            
            return (
              <div 
                key={restaurant.id} 
                className={`p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                  urgency === 'high' ? 'bg-red-50 border-l-4 border-l-red-500' :
                  urgency === 'medium' ? 'bg-yellow-50 border-l-4 border-l-yellow-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Encabezado del restaurante */}
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-foreground truncate">
                        {restaurant.base_restaurant?.restaurant_name || `Restaurante ${restaurant.base_restaurant?.site_number}`}
                      </h4>
                      <Badge className={getStatusColor(restaurant.status)}>
                        {restaurant.status || 'active'}
                      </Badge>
                      {urgency && (
                        <Badge variant="destructive" className="text-xs">
                          {urgency === 'high' ? 'Urgente' : 'Atención'}
                        </Badge>
                      )}
                    </div>

                    {/* Información clave */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">
                          {restaurant.base_restaurant?.city || 'Ciudad'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3 h-3" />
                        <span>#{restaurant.base_restaurant?.site_number || 'N/A'}</span>
                      </div>

                      {restaurant.last_year_revenue && (
                        <div className="text-green-600 font-medium">
                          {formatCurrency(restaurant.last_year_revenue)}
                        </div>
                      )}

                      {restaurant.franchise_end_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span className={urgency ? 'font-medium text-red-600' : ''}>
                            {new Date(restaurant.franchise_end_date).toLocaleDateString('es-ES', { 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/employees?restaurant=${restaurant.id}`)}
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/profit-loss/${restaurant.base_restaurant?.site_number}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/restaurant/manage')}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {restaurants.length > 5 && (
          <div className="p-4 border-t bg-muted/30">
            <Button 
              variant="link" 
              className="w-full text-primary"
              onClick={() => navigate('/restaurant/manage')}
            >
              Ver {restaurants.length - 5} restaurantes más
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

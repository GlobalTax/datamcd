import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { RestaurantKPICards } from './RestaurantKPICards';
import { RestaurantGeneralTab } from './RestaurantGeneralTab';
import { RestaurantFinanceTab } from './RestaurantFinanceTab';
import { RestaurantIncidentsTab } from './RestaurantIncidentsTab';
import { RestaurantPersonnelTab } from './RestaurantPersonnelTab';
import { RestaurantAnalyticsTab } from './RestaurantAnalyticsTab';
import { RestaurantOperationsTab } from './RestaurantOperationsTab';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Euro, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Home
} from 'lucide-react';

interface RestaurantPanelProps {
  restaurantId: string;
}

export const RestaurantPanel: React.FC<RestaurantPanelProps> = ({ restaurantId }) => {
  const { restaurant, loading, error } = useRestaurantData(restaurantId);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando datos del restaurante...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center max-w-md mx-auto">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-6" />
            <h3 className="text-xl font-semibold mb-3">Restaurante no encontrado</h3>
            <p className="text-muted-foreground mb-6">
              {error?.includes('no encontrado') || error?.includes('no tienes acceso') 
                ? 'Este restaurante no existe o no tienes permisos para acceder a él.'
                : error || 'No se pudieron cargar los datos del restaurante'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <Button 
                onClick={() => navigate('/advisor')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Ir al Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Restaurant Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {restaurant.base_restaurant?.restaurant_name}
                </CardTitle>
                <p className="text-muted-foreground">
                  Site #{restaurant.base_restaurant?.site_number} • {restaurant.base_restaurant?.city}
                </p>
              </div>
            </div>
            <Badge variant={restaurant.status === 'active' ? 'default' : 'secondary'}>
              {restaurant.status === 'active' ? 'Activo' : restaurant.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Cards */}
      <RestaurantKPICards restaurantId={restaurantId} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Finanzas
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Incidencias
          </TabsTrigger>
          <TabsTrigger value="personnel" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Operaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <RestaurantGeneralTab restaurant={restaurant} />
        </TabsContent>

        <TabsContent value="finance" className="mt-6">
          <RestaurantFinanceTab restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="incidents" className="mt-6">
          <RestaurantIncidentsTab restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="personnel" className="mt-6">
          <RestaurantPersonnelTab restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <RestaurantAnalyticsTab restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <RestaurantOperationsTab restaurantId={restaurantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
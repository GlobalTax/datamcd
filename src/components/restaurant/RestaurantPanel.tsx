import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRestaurantDataLegacy } from '@/hooks/data/useRestaurantData';
import { RestaurantKPICards } from './RestaurantKPICards';
import { RestaurantGeneralTab } from './RestaurantGeneralTab';
import { RestaurantFinanceTab } from './RestaurantFinanceTab';
import { RestaurantIncidentsTab } from './RestaurantIncidentsTab';
import { RestaurantPersonnelTab } from './RestaurantPersonnelTab';
import { RestaurantAnalyticsTab } from './RestaurantAnalyticsTab';
import { RestaurantCompanyTab } from './RestaurantCompanyTab';

import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Euro, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  FileText,
  ArrowLeft,
  Home,
  Building
} from 'lucide-react';

interface RestaurantPanelProps {
  restaurantId: string;
}

export const RestaurantPanel: React.FC<RestaurantPanelProps> = ({ restaurantId }) => {
  const { restaurant, loading, error, refetch } = useRestaurantDataLegacy(restaurantId);
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
          <div className="text-center max-w-lg mx-auto">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-6" />
            <h3 className="text-xl font-semibold mb-3">Restaurante no disponible</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'No se pudieron cargar los datos del restaurante'}
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg mb-6 text-left">
              <h4 className="font-medium text-foreground mb-2">Posibles causas:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• El restaurante no está asignado a tu franquicia</li>
                <li>• El ID del restaurante no es válido</li>
                <li>• No tienes permisos para acceder a este restaurante</li>
                <li>• El restaurante ha sido eliminado o desactivado</li>
              </ul>
            </div>
            
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
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/restaurants')}
                className="flex items-center gap-2"
              >
                <Building className="h-4 w-4" />
                Ver Restaurantes
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
        <TabsList className="w-full flex flex-wrap sm:grid sm:grid-cols-6 gap-1 h-auto p-1">
          <TabsTrigger value="general" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden">Gen</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
            <Euro className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Finanzas</span>
            <span className="sm:hidden">Fin</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Incidencias</span>
            <span className="sm:hidden">Inc</span>
          </TabsTrigger>
          <TabsTrigger value="personnel" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Personal</span>
            <span className="sm:hidden">Per</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Ana</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Empresa</span>
            <span className="sm:hidden">Emp</span>
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

        <TabsContent value="company" className="mt-6">
          <RestaurantCompanyTab restaurantId={restaurantId} />
        </TabsContent>

      </Tabs>
    </div>
  );
};
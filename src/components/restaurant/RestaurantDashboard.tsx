
import React, { useState, useMemo } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useOptimizedFranchiseeRestaurants } from '@/hooks/useOptimizedFranchiseeRestaurants';
import { useAllRestaurants } from '@/hooks/useAllRestaurants';
import { RestaurantMetricsGrid } from './RestaurantMetricsGrid';
import { RestaurantQuickManagement } from './RestaurantQuickManagement';
import { RestaurantAlertsWidget } from './RestaurantAlertsWidget';
import { RestaurantPerformanceChart } from './RestaurantPerformanceChart';
import { RestaurantAdvancedSearch } from './RestaurantAdvancedSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, RefreshCw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { user, franchisee } = useUnifiedAuth();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    city: '',
    status: '',
    franchisee: '',
    restaurantType: ''
  });

  // Usar hook apropiado según el rol del usuario
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  
  // Hook para admin/superadmin - ve todos los restaurantes
  const adminData = useAllRestaurants();
  
  // Hook para franchisee - ve solo sus restaurantes
  const franchiseeData = useOptimizedFranchiseeRestaurants();
  
  // Seleccionar los datos apropiados según el rol
  const { restaurants, loading, refetch } = isAdmin ? adminData : franchiseeData;

  console.log('RestaurantDashboard - User role:', user?.role);
  console.log('RestaurantDashboard - Using admin data:', isAdmin);
  console.log('RestaurantDashboard - Restaurants:', restaurants.length);

  const handleRefresh = () => {
    refetch();
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      // Filtro de búsqueda de texto
      if (searchFilters.search) {
        const searchTerm = searchFilters.search.toLowerCase();
        const restaurantName = (restaurant.base_restaurant?.restaurant_name || '').toLowerCase();
        const siteNumber = (restaurant.base_restaurant?.site_number || '').toLowerCase();
        const address = (restaurant.base_restaurant?.address || '').toLowerCase();
        const city = (restaurant.base_restaurant?.city || '').toLowerCase();
        const franchiseeName = ((restaurant as any).franchisees?.franchisee_name || restaurant.base_restaurant?.franchisee_name || '').toLowerCase();
        
        if (!restaurantName.includes(searchTerm) && 
            !siteNumber.includes(searchTerm) && 
            !address.includes(searchTerm) && 
            !city.includes(searchTerm) &&
            !franchiseeName.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por ciudad
      if (searchFilters.city && restaurant.base_restaurant?.city !== searchFilters.city) {
        return false;
      }

      // Filtro por estado
      if (searchFilters.status && restaurant.status !== searchFilters.status) {
        return false;
      }

      // Filtro por franquiciado
      if (searchFilters.franchisee) {
        const franchiseeName = (restaurant as any).franchisees?.franchisee_name || restaurant.base_restaurant?.franchisee_name;
        if (franchiseeName !== searchFilters.franchisee) {
          return false;
        }
      }

      // Filtro por tipo de restaurante
      if (searchFilters.restaurantType && restaurant.base_restaurant?.restaurant_type !== searchFilters.restaurantType) {
        return false;
      }

      return true;
    });
  }, [restaurants, searchFilters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              {isAdmin ? 'Dashboard Global de Restaurantes' : 'Dashboard de Restaurantes'}
            </h2>
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredRestaurants.length} restaurantes
          </Badge>
          {isAdmin && (
            <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-200">
              Vista Superadmin
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/franchisees')}
            >
              <Users className="w-4 h-4 mr-2" />
              Franquiciados
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => navigate('/restaurant/manage')}>
            <Plus className="w-4 h-4 mr-2" />
            Gestionar
          </Button>
        </div>
      </div>

      {/* Búsqueda y filtros avanzados */}
      <RestaurantAdvancedSearch
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        restaurants={restaurants}
        isExpanded={searchExpanded}
        onToggleExpanded={() => setSearchExpanded(!searchExpanded)}
      />

      {/* Grid de métricas principales */}
      <RestaurantMetricsGrid restaurants={filteredRestaurants} />

      {/* Contenido principal en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal - 2/3 del ancho */}
        <div className="lg:col-span-2 space-y-6">
          <RestaurantPerformanceChart restaurants={filteredRestaurants} />
          <RestaurantQuickManagement restaurants={filteredRestaurants} />
        </div>

        {/* Sidebar - 1/3 del ancho */}
        <div className="space-y-6">
          <RestaurantAlertsWidget 
            restaurants={filteredRestaurants}
            franchiseeId={isAdmin ? undefined : franchisee?.id}
          />
        </div>
      </div>
    </div>
  );
};

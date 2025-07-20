
import React, { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { useOptimizedFranchiseeRestaurants } from '@/hooks/useOptimizedFranchiseeRestaurants';
import { RestaurantMetricsGrid } from './RestaurantMetricsGrid';
import { RestaurantQuickManagement } from './RestaurantQuickManagement';
import { RestaurantAlertsWidget } from './RestaurantAlertsWidget';
import { RestaurantPerformanceChart } from './RestaurantPerformanceChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, RefreshCw, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { user, franchisee } = useUnifiedAuth();
  const { restaurants, loading, refetch } = useOptimizedFranchiseeRestaurants();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  console.log('RestaurantDashboard - Restaurants:', restaurants.length);

  const handleRefresh = () => {
    refetch();
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return restaurant.status === 'active';
    if (selectedFilter === 'inactive') return restaurant.status !== 'active';
    return true;
  });

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
            <h2 className="text-2xl font-bold text-foreground">Dashboard de Restaurantes</h2>
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredRestaurants.length} restaurantes
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedFilter(selectedFilter === 'all' ? 'active' : 'all')}
          >
            <Filter className="w-4 h-4 mr-2" />
            {selectedFilter === 'all' ? 'Mostrar Activos' : 'Mostrar Todos'}
          </Button>
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
            franchiseeId={franchisee?.id}
          />
        </div>
      </div>
    </div>
  );
};

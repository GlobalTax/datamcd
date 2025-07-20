
import React, { useState, useMemo } from 'react';
import { DataTable, Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, MapPin, Euro } from 'lucide-react';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

interface RestaurantTableProps {
  restaurants: FranchiseeRestaurant[];
  canViewAllRestaurants: boolean;
  onEdit: (restaurant: FranchiseeRestaurant) => void;
  onView: (restaurant: FranchiseeRestaurant) => void;
  loading?: boolean;
}

const RestaurantTable: React.FC<RestaurantTableProps> = ({
  restaurants,
  canViewAllRestaurants,
  onEdit,
  onView,
  loading = false
}) => {
  const formatCurrency = (value: number | undefined | null): string => {
    if (!value) return '—';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const columns: Column<FranchiseeRestaurant>[] = useMemo(() => {
    const baseColumns: Column<FranchiseeRestaurant>[] = [
      {
        key: 'restaurant_name',
        header: 'Restaurante',
        sortable: true,
        render: (restaurant) => (
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium text-gray-900">
                {restaurant.base_restaurant?.restaurant_name || 'Sin nombre'}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {restaurant.base_restaurant?.city || 'Sin ciudad'}
              </div>
            </div>
          </div>
        )
      },
      {
        key: 'site_number',
        header: 'Sitio',
        sortable: true,
        render: (restaurant) => (
          <span className="font-mono text-sm">
            {restaurant.base_restaurant?.site_number || '—'}
          </span>
        )
      }
    ];

    if (canViewAllRestaurants) {
      baseColumns.push({
        key: 'franchisee_name',
        header: 'Franquiciado',
        sortable: true,
        render: (restaurant) => (
          <div className="text-sm">
            {(restaurant as any).franchisee_display_name || 'Sin asignar'}
          </div>
        )
      });
    }

    baseColumns.push(
      {
        key: 'status',
        header: 'Estado',
        sortable: true,
        render: (restaurant) => (
          <Badge 
            variant="outline" 
            className={getStatusColor(restaurant.status || 'inactive')}
          >
            {restaurant.status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        )
      },
      {
        key: 'monthly_rent',
        header: 'Renta Mensual',
        sortable: true,
        render: (restaurant) => (
          <div className="text-sm font-medium text-right">
            {formatCurrency(restaurant.monthly_rent)}
          </div>
        )
      },
      {
        key: 'last_year_revenue',
        header: 'Ingresos Anuales',
        sortable: true,
        render: (restaurant) => (
          <div className="text-sm font-medium text-right">
            {formatCurrency(restaurant.last_year_revenue)}
          </div>
        )
      },
      {
        key: 'actions',
        header: 'Acciones',
        render: (restaurant) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(restaurant)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(restaurant)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    );

    return baseColumns;
  }, [canViewAllRestaurants, onEdit, onView]);

  return (
    <DataTable
      data={restaurants}
      columns={columns}
      searchable={true}
      searchPlaceholder="Buscar por restaurante, ciudad o franquiciado..."
      filterable={true}
      pageSize={50}
      loading={loading}
      emptyMessage="No se encontraron restaurantes"
      className="bg-white rounded-lg border"
    />
  );
};

export default RestaurantTable;

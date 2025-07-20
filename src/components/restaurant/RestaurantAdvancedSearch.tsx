import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, MapPin, Building, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SearchFilters {
  search: string;
  city: string;
  status: string;
  franchisee: string;
  restaurantType: string;
}

interface RestaurantAdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  restaurants: any[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const RestaurantAdvancedSearch: React.FC<RestaurantAdvancedSearchProps> = ({
  filters,
  onFiltersChange,
  restaurants,
  isExpanded,
  onToggleExpanded
}) => {
  const cities = [...new Set(restaurants.map(r => (r as any).base_restaurant?.city).filter(Boolean))].sort();
  const franchisees = [...new Set(restaurants.map(r => (r as any).franchisees?.franchisee_name || (r as any).base_restaurant?.franchisee_name).filter(Boolean))].sort();
  const restaurantTypes = [...new Set(restaurants.map(r => (r as any).base_restaurant?.restaurant_type).filter(Boolean))].sort();

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      city: '',
      status: '',
      franchisee: '',
      restaurantType: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Búsqueda principal */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, número de sitio, dirección..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={onToggleExpanded}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Filtros expandidos */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ciudad
                </label>
                <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las ciudades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las ciudades</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Estado
                </label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Franquiciado
                </label>
                <Select value={filters.franchisee} onValueChange={(value) => handleFilterChange('franchisee', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los franquiciados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los franquiciados</SelectItem>
                    {franchisees.map(franchisee => (
                      <SelectItem key={franchisee} value={franchisee}>{franchisee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Tipo de Restaurante
                </label>
                <Select value={filters.restaurantType} onValueChange={(value) => handleFilterChange('restaurantType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los tipos</SelectItem>
                    {restaurantTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Filtros activos */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Búsqueda: {filters.search}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('search', '')}
                  />
                </Badge>
              )}
              {filters.city && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Ciudad: {filters.city}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('city', '')}
                  />
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Estado: {filters.status}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('status', '')}
                  />
                </Badge>
              )}
              {filters.franchisee && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Franquiciado: {filters.franchisee}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('franchisee', '')}
                  />
                </Badge>
              )}
              {filters.restaurantType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tipo: {filters.restaurantType}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleFilterChange('restaurantType', '')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X, Search } from 'lucide-react';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

interface RestaurantFiltersProps {
  restaurants: FranchiseeRestaurant[];
  canViewAllRestaurants: boolean;
  onFiltersChange: (filteredRestaurants: FranchiseeRestaurant[]) => void;
}

interface FilterState {
  search: string;
  status: string;
  city: string;
  franchisee: string;
  minRevenue: string;
  maxRevenue: string;
}

const RestaurantFilters: React.FC<RestaurantFiltersProps> = ({
  restaurants,
  canViewAllRestaurants,
  onFiltersChange
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    city: '',
    franchisee: '',
    minRevenue: '',
    maxRevenue: ''
  });
  
  const [isOpen, setIsOpen] = useState(false);

  // Extraer valores únicos para los selectores
  const uniqueCities = [...new Set(
    restaurants
      .map(r => r.base_restaurant?.city)
      .filter(Boolean)
      .sort()
  )];

  const uniqueFranchisees = canViewAllRestaurants 
    ? [...new Set(
        restaurants
          .map(r => (r as any).franchisee_display_name)
          .filter(name => name && name !== 'Sin asignar')
          .sort()
      )]
    : [];

  const applyFilters = (newFilters: FilterState) => {
    let filtered = [...restaurants];

    // Filtro de búsqueda
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.base_restaurant?.restaurant_name?.toLowerCase().includes(searchLower) ||
        r.base_restaurant?.city?.toLowerCase().includes(searchLower) ||
        r.base_restaurant?.site_number?.toLowerCase().includes(searchLower) ||
        (canViewAllRestaurants && (r as any).franchisee_display_name?.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por estado
    if (newFilters.status) {
      filtered = filtered.filter(r => r.status === newFilters.status);
    }

    // Filtro por ciudad
    if (newFilters.city) {
      filtered = filtered.filter(r => r.base_restaurant?.city === newFilters.city);
    }

    // Filtro por franquiciado
    if (newFilters.franchisee && canViewAllRestaurants) {
      filtered = filtered.filter(r => (r as any).franchisee_display_name === newFilters.franchisee);
    }

    // Filtro por ingresos mínimos
    if (newFilters.minRevenue) {
      const minRev = parseFloat(newFilters.minRevenue);
      if (!isNaN(minRev)) {
        filtered = filtered.filter(r => (r.last_year_revenue || 0) >= minRev);
      }
    }

    // Filtro por ingresos máximos
    if (newFilters.maxRevenue) {
      const maxRev = parseFloat(newFilters.maxRevenue);
      if (!isNaN(maxRev)) {
        filtered = filtered.filter(r => (r.last_year_revenue || 0) <= maxRev);
      }
    }

    onFiltersChange(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterState = {
      search: '',
      status: '',
      city: '',
      franchisee: '',
      minRevenue: '',
      maxRevenue: ''
    };
    setFilters(emptyFilters);
    applyFilters(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Barra de búsqueda */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar restaurantes..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros avanzados */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-100 text-blue-800"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Filtros Avanzados</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ciudad */}
            <div>
              <label className="text-sm font-medium mb-2 block">Ciudad</label>
              <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ciudades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las ciudades</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city!}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Franquiciado (solo para admin/superadmin) */}
            {canViewAllRestaurants && (
              <div>
                <label className="text-sm font-medium mb-2 block">Franquiciado</label>
                <Select value={filters.franchisee} onValueChange={(value) => handleFilterChange('franchisee', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los franquiciados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los franquiciados</SelectItem>
                    {uniqueFranchisees.map(franchisee => (
                      <SelectItem key={franchisee} value={franchisee}>{franchisee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Rango de ingresos */}
            <div>
              <label className="text-sm font-medium mb-2 block">Ingresos Anuales (€)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Mínimo"
                  type="number"
                  value={filters.minRevenue}
                  onChange={(e) => handleFilterChange('minRevenue', e.target.value)}
                />
                <Input
                  placeholder="Máximo"
                  type="number"
                  value={filters.maxRevenue}
                  onChange={(e) => handleFilterChange('maxRevenue', e.target.value)}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RestaurantFilters;

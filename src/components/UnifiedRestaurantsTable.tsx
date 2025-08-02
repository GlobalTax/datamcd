import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Building, 
  MapPin, 
  Hash, 
  ExternalLink, 
  Search, 
  Filter,
  Calendar,
  Euro,
  User,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Define UnifiedRestaurant interface locally - will be moved to types later
export interface UnifiedRestaurant {
  id: string;
  restaurant_name: string;
  site_number: string;
  address: string;
  city: string;
  state?: string;
  autonomous_community?: string;
  restaurant_type: string;
  opening_date?: string;
  created_at: string;
  status?: string;
  franchisee_id?: string;
  assignment?: {
    id: string;
    franchisee_id: string;
    franchise_start_date?: string;
    franchise_end_date?: string;
    monthly_rent?: number;
    last_year_revenue?: number;
    average_monthly_sales?: number;
    status?: string;
    assigned_at: string;
  };
  franchisee_info?: {
    id: string;
    franchisee_name: string;
    company_name?: string;
    city?: string;
    state?: string;
  };
  isAssigned: boolean;
}

interface UnifiedRestaurantsTableProps {
  restaurants: UnifiedRestaurant[];
  loading: boolean;
  onRefresh: () => void;
  stats: {
    total: number;
    assigned: number;
    available: number;
  };
}

const ITEMS_PER_PAGE = 25;

export const UnifiedRestaurantsTable: React.FC<UnifiedRestaurantsTableProps> = ({
  restaurants,
  loading,
  onRefresh,
  stats
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'available'>('all');
  const [cityFilter, setCityFilter] = useState('all');

  const createGoogleMapsLink = (address?: string, city?: string) => {
    if (!address && !city) return null;
    
    const fullAddress = [address, city].filter(Boolean).join(', ');
    const encodedAddress = encodeURIComponent(fullAddress);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount?: number) => {
    if (!amount || isNaN(amount)) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Obtener ciudades únicas para el filtro
  const cities = useMemo(() => {
    const uniqueCities = new Set<string>();
    restaurants.forEach(restaurant => {
      if (restaurant.city) {
        uniqueCities.add(restaurant.city);
      }
    });
    return Array.from(uniqueCities).sort();
  }, [restaurants]);

  // Filtrar restaurantes
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      // Filtro de búsqueda
      const searchMatch = !searchTerm || 
        restaurant.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.site_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.city && restaurant.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (restaurant.franchisee_info?.franchisee_name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de estado
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'assigned' && restaurant.isAssigned) ||
        (statusFilter === 'available' && !restaurant.isAssigned);

      // Filtro de ciudad
      const cityMatch = cityFilter === 'all' || restaurant.city === cityFilter;

      return searchMatch && statusMatch && cityMatch;
    });
  }, [restaurants, searchTerm, statusFilter, cityFilter]);

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRestaurants = filteredRestaurants.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, cityFilter]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando restaurantes...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Restaurantes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Asignados</p>
                <p className="text-2xl font-bold text-green-600">{stats.assigned}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold text-orange-600">{stats.available}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Lista Unificada de Restaurantes ({filteredRestaurants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, número de sitio, ciudad o franquiciado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="assigned">Asignados</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ciudades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={onRefresh} variant="outline">
              Actualizar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurante</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Franquiciado</TableHead>
                  <TableHead>Financiero</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Panel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRestaurants.map((restaurant) => {
                  const googleMapsLink = createGoogleMapsLink(restaurant.address, restaurant.city);
                  
                  return (
                    <TableRow key={restaurant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{restaurant.restaurant_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {restaurant.site_number}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {restaurant.restaurant_type}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-start gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{restaurant.city}</span>
                              {googleMapsLink && (
                                <a
                                  href={googleMapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Ver en Google Maps"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {restaurant.address}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {restaurant.state || restaurant.autonomous_community}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`${
                          restaurant.isAssigned 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                        }`}>
                          {restaurant.isAssigned ? 'Asignado' : 'Disponible'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {restaurant.franchisee_info ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-blue-600" />
                              <span className="font-medium">
                                {restaurant.franchisee_info.franchisee_name}
                              </span>
                            </div>
                            {restaurant.franchisee_info.company_name && (
                              <div className="text-xs text-muted-foreground">
                                {restaurant.franchisee_info.company_name}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {restaurant.franchisee_info.city}, {restaurant.franchisee_info.state}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No asignado</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {restaurant.assignment ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Euro className="w-3 h-3 text-green-600" />
                              <span>Renta: {formatCurrency(restaurant.assignment.monthly_rent)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Año: {formatCurrency(restaurant.assignment.last_year_revenue)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Mensual: {formatCurrency(restaurant.assignment.average_monthly_sales)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {restaurant.assignment ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-green-600" />
                              <span className="text-xs">
                                Inicio: {formatDate(restaurant.assignment.franchise_start_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-red-600" />
                              <span className="text-xs">
                                Fin: {formatDate(restaurant.assignment.franchise_end_date)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Asignado: {formatDate(restaurant.assignment.assigned_at)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs">
                                Creado: {formatDate(restaurant.created_at)}
                              </span>
                            </div>
                            {restaurant.opening_date && (
                              <div className="text-xs text-muted-foreground">
                                Apertura: {formatDate(restaurant.opening_date)}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {restaurant.isAssigned && restaurant.assignment?.status === 'assigned' ? (
                          <Button
                            onClick={() => navigate(`/restaurant/${restaurant.assignment.id}/panel`)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            title="Ver panel integral del restaurante"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Panel
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="gap-2 text-muted-foreground"
                            title={
                              !restaurant.isAssigned 
                                ? 'Restaurante no asignado a ninguna franquicia'
                                : 'Panel no disponible para este restaurante'
                            }
                          >
                            <BarChart3 className="w-4 h-4" />
                            No disponible
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {filteredRestaurants.length === 0 && !loading && (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron restaurantes</h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
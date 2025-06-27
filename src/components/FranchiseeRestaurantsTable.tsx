
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Building, MapPin, Calendar, Euro, Hash, ExternalLink } from 'lucide-react';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

interface FranchiseeRestaurantsTableProps {
  franchiseeId: string;
  restaurants: FranchiseeRestaurant[];
}

const ITEMS_PER_PAGE = 40;

export const FranchiseeRestaurantsTable: React.FC<FranchiseeRestaurantsTableProps> = ({
  restaurants
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return '-';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount || isNaN(amount)) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const createGoogleMapsLink = (address?: string, city?: string) => {
    if (!address && !city) return null;
    
    const fullAddress = [address, city].filter(Boolean).join(', ');
    const encodedAddress = encodeURIComponent(fullAddress);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  // Calcular paginación
  const totalPages = Math.ceil(restaurants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRestaurants = restaurants.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave hacia arriba de la tabla
    document.querySelector('[data-table-container]')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start' 
    });
  };

  console.log('FranchiseeRestaurantsTable - Rendering with restaurants:', restaurants);

  if (restaurants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Restaurantes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay restaurantes asignados
            </h3>
            <p className="text-gray-600">
              Este franquiciado aún no tiene restaurantes asignados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-table-container>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Restaurantes ({restaurants.length})
          </CardTitle>
          {totalPages > 1 && (
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1}-{Math.min(endIndex, restaurants.length)} de {restaurants.length}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurante</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fechas Franquicia</TableHead>
                <TableHead>Renta Mensual</TableHead>
                <TableHead>Facturación</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRestaurants.map((restaurant) => {
                const baseRestaurant = restaurant.base_restaurant;
                const googleMapsLink = createGoogleMapsLink(
                  baseRestaurant?.address, 
                  baseRestaurant?.city
                );
                console.log('FranchiseeRestaurantsTable - Processing restaurant:', restaurant);
                
                return (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {baseRestaurant?.restaurant_name || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {baseRestaurant?.site_number || 'Sin número'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <span>{baseRestaurant?.city || 'Sin ciudad'}</span>
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
                          <div className="text-gray-500">
                            {baseRestaurant?.address || 'Sin dirección'}
                          </div>
                          <div className="text-gray-500">
                            {baseRestaurant?.state || baseRestaurant?.autonomous_community || ''}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{baseRestaurant?.restaurant_type || '-'}</div>
                        <div className="text-gray-500">
                          {baseRestaurant?.property_type || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-green-600" />
                          <span>Inicio: {formatDate(restaurant.franchise_start_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-red-600" />
                          <span>Fin: {formatDate(restaurant.franchise_end_date)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="w-4 h-4 text-blue-600" />
                        <span>{formatCurrency(restaurant.monthly_rent)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Año: {formatCurrency(restaurant.last_year_revenue)}</div>
                        <div className="text-gray-500">
                          Mensual: {formatCurrency(restaurant.average_monthly_sales)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${
                        restaurant.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurant.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
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
      </CardContent>
    </Card>
  );
};

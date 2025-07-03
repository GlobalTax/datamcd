import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Building, Edit, Trash2, Plus, Search, MapPin, Hash, ExternalLink, Settings2, Calendar, User, FileText } from 'lucide-react';
import { BaseRestaurant } from '@/types/franchiseeRestaurant';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BaseRestaurantsTableProps {
  restaurants: BaseRestaurant[];
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 40;

interface ColumnSettings {
  franchiseeInfo: boolean;
  propertyDetails: boolean;
  dates: boolean;
  location: boolean;
}

export const BaseRestaurantsTable: React.FC<BaseRestaurantsTableProps> = ({
  restaurants,
  onRefresh
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<BaseRestaurant | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [columnSettings, setColumnSettings] = useState<ColumnSettings>({
    franchiseeInfo: false,
    propertyDetails: false,
    dates: false,
    location: true
  });

  const [formData, setFormData] = useState({
    site_number: '',
    restaurant_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'España',
    restaurant_type: 'traditional',
    property_type: '',
    autonomous_community: '',
    square_meters: '',
    seating_capacity: '',
    opening_date: ''
  });

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant =>
      restaurant.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.site_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (restaurant.city && restaurant.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [restaurants, searchTerm]);

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRestaurants = filteredRestaurants.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page cuando cambia el término de búsqueda
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const resetForm = () => {
    setFormData({
      site_number: '',
      restaurant_name: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'España',
      restaurant_type: 'traditional',
      property_type: '',
      autonomous_community: '',
      square_meters: '',
      seating_capacity: '',
      opening_date: ''
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { error } = await supabase
        .from('base_restaurants')
        .insert({
          site_number: formData.site_number,
          restaurant_name: formData.restaurant_name,
          address: formData.address,
          city: formData.city,
          state: formData.state || null,
          postal_code: formData.postal_code || null,
          country: formData.country,
          restaurant_type: formData.restaurant_type,
          property_type: formData.property_type || null,
          autonomous_community: formData.autonomous_community || null,
          square_meters: formData.square_meters ? parseInt(formData.square_meters) : null,
          seating_capacity: formData.seating_capacity ? parseInt(formData.seating_capacity) : null,
          opening_date: formData.opening_date || null
        });

      if (error) {
        toast.error('Error al crear el restaurante');
        return;
      }

      toast.success('Restaurante creado exitosamente');
      setIsCreateModalOpen(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error in handleCreate:', error);
      toast.error('Error al crear el restaurante');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('base_restaurants')
        .update({
          site_number: formData.site_number,
          restaurant_name: formData.restaurant_name,
          address: formData.address,
          city: formData.city,
          state: formData.state || null,
          postal_code: formData.postal_code || null,
          country: formData.country,
          restaurant_type: formData.restaurant_type,
          property_type: formData.property_type || null,
          autonomous_community: formData.autonomous_community || null,
          square_meters: formData.square_meters ? parseInt(formData.square_meters) : null,
          seating_capacity: formData.seating_capacity ? parseInt(formData.seating_capacity) : null,
          opening_date: formData.opening_date || null
        })
        .eq('id', selectedRestaurant.id);

      if (error) {
        toast.error('Error al actualizar el restaurante');
        return;
      }

      toast.success('Restaurante actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedRestaurant(null);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error in handleEdit:', error);
      toast.error('Error al actualizar el restaurante');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (restaurant: BaseRestaurant) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el restaurante ${restaurant.restaurant_name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('base_restaurants')
        .delete()
        .eq('id', restaurant.id);

      if (error) {
        toast.error('Error al eliminar el restaurante');
        return;
      }

      toast.success('Restaurante eliminado exitosamente');
      onRefresh();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast.error('Error al eliminar el restaurante');
    }
  };

  const openEditModal = (restaurant: BaseRestaurant) => {
    setSelectedRestaurant(restaurant);
    setFormData({
      site_number: restaurant.site_number,
      restaurant_name: restaurant.restaurant_name,
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state || '',
      postal_code: restaurant.postal_code || '',
      country: restaurant.country,
      restaurant_type: restaurant.restaurant_type,
      property_type: restaurant.property_type || '',
      autonomous_community: restaurant.autonomous_community || '',
      square_meters: restaurant.square_meters?.toString() || '',
      seating_capacity: restaurant.seating_capacity?.toString() || '',
      opening_date: restaurant.opening_date || ''
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Restaurantes Base ({filteredRestaurants.length})</h3>
        <div className="flex gap-2">
          <Dialog open={isColumnSettingsOpen} onOpenChange={setIsColumnSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="w-4 h-4 mr-2" />
                Columnas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Configurar Columnas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="franchiseeInfo"
                    checked={columnSettings.franchiseeInfo}
                    onCheckedChange={(checked) => 
                      setColumnSettings(prev => ({ ...prev, franchiseeInfo: checked as boolean }))
                    }
                  />
                  <Label htmlFor="franchiseeInfo" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Información de Franquiciado
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="propertyDetails"
                    checked={columnSettings.propertyDetails}
                    onCheckedChange={(checked) => 
                      setColumnSettings(prev => ({ ...prev, propertyDetails: checked as boolean }))
                    }
                  />
                  <Label htmlFor="propertyDetails" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Detalles de Propiedad
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dates"
                    checked={columnSettings.dates}
                    onCheckedChange={(checked) => 
                      setColumnSettings(prev => ({ ...prev, dates: checked as boolean }))
                    }
                  />
                  <Label htmlFor="dates" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fechas
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="location"
                    checked={columnSettings.location}
                    onCheckedChange={(checked) => 
                      setColumnSettings(prev => ({ ...prev, location: checked as boolean }))
                    }
                  />
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ubicación Detallada
                  </Label>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Crear Restaurante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Restaurante</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="site_number">Número de Sitio</Label>
                    <Input
                      id="site_number"
                      value={formData.site_number}
                      onChange={(e) => setFormData({...formData, site_number: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="restaurant_name">Nombre del Restaurante</Label>
                    <Input
                      id="restaurant_name"
                      value={formData.restaurant_name}
                      onChange={(e) => setFormData({...formData, restaurant_name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Input
                        placeholder="Dirección"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Ciudad"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Provincia"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Código Postal"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="restaurant_type">Tipo de Restaurante</Label>
                    <Input
                      id="restaurant_type"
                      value={formData.restaurant_type}
                      onChange={(e) => setFormData({...formData, restaurant_type: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="property_type">Tipo de Propiedad</Label>
                    <Input
                      id="property_type"
                      value={formData.property_type}
                      onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="autonomous_community">Comunidad Autónoma</Label>
                    <Input
                      id="autonomous_community"
                      value={formData.autonomous_community}
                      onChange={(e) => setFormData({...formData, autonomous_community: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="square_meters">Metros Cuadrados</Label>
                    <Input
                      id="square_meters"
                      type="number"
                      value={formData.square_meters}
                      onChange={(e) => setFormData({...formData, square_meters: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seating_capacity">Capacidad de Asientos</Label>
                    <Input
                      id="seating_capacity"
                      type="number"
                      value={formData.seating_capacity}
                      onChange={(e) => setFormData({...formData, seating_capacity: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="opening_date">Fecha de Apertura</Label>
                    <Input
                      id="opening_date"
                      type="date"
                      value={formData.opening_date}
                      onChange={(e) => setFormData({...formData, opening_date: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => {setIsCreateModalOpen(false); resetForm();}}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating} className="bg-red-600 hover:bg-red-700">
                    {creating ? 'Creando...' : 'Crear Restaurante'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar restaurantes por nombre, número de sitio, ciudad o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contador de resultados */}
      {filteredRestaurants.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredRestaurants.length)} de {filteredRestaurants.length} restaurantes
          </div>
          {totalPages > 1 && (
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
          )}
        </div>
      )}

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurante</TableHead>
              <TableHead>Ubicación</TableHead>
              {columnSettings.franchiseeInfo && <TableHead>Franquiciado</TableHead>}
              {columnSettings.propertyDetails && <TableHead>Propiedad</TableHead>}
              {columnSettings.dates && <TableHead>Fecha Apertura</TableHead>}
              {columnSettings.location && <TableHead>Ubicación Detallada</TableHead>}
              <TableHead>Tipo</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Acciones</TableHead>
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
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {restaurant.site_number}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-1">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span>{restaurant.city}</span>
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
                        <div className="text-gray-500">{restaurant.address}</div>
                      </div>
                    </div>
                  </TableCell>
                  {columnSettings.franchiseeInfo && (
                    <TableCell>
                      <div className="text-sm">
                        {restaurant.franchisee_name && (
                          <div className="font-medium">{restaurant.franchisee_name}</div>
                        )}
                        {restaurant.franchisee_email && (
                          <div className="text-gray-500">{restaurant.franchisee_email}</div>
                        )}
                        {restaurant.company_tax_id && (
                          <div className="text-xs text-gray-400">{restaurant.company_tax_id}</div>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {columnSettings.propertyDetails && (
                    <TableCell>
                      <div className="text-sm">
                        {restaurant.property_type && (
                          <div>{restaurant.property_type}</div>
                        )}
                        {restaurant.autonomous_community && (
                          <div className="text-gray-500">{restaurant.autonomous_community}</div>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {columnSettings.dates && (
                    <TableCell>
                      <div className="text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDate(restaurant.opening_date)}
                      </div>
                    </TableCell>
                  )}
                  {columnSettings.location && (
                    <TableCell>
                      <div className="text-sm">
                        {restaurant.state && (
                          <div>{restaurant.state}</div>
                        )}
                        {restaurant.postal_code && (
                          <div className="text-gray-500">{restaurant.postal_code}</div>
                        )}
                        {restaurant.country && (
                          <div className="text-xs text-gray-400">{restaurant.country}</div>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="outline">
                      {restaurant.restaurant_type === 'traditional' ? 'Tradicional' : restaurant.restaurant_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {restaurant.seating_capacity && (
                        <div>{restaurant.seating_capacity} asientos</div>
                      )}
                      {restaurant.square_meters && (
                        <div className="text-gray-500">{restaurant.square_meters} m²</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditModal(restaurant)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(restaurant)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Paginación inferior */}
      {totalPages > 1 && (
        <div className="flex justify-center">
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

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron restaurantes' : 'No hay restaurantes'}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea el primer restaurante para comenzar'}
          </p>
        </div>
      )}

      {/* Modal de Edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Restaurante</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_site_number">Número de Sitio</Label>
                <Input
                  id="edit_site_number"
                  value={formData.site_number}
                  onChange={(e) => setFormData({...formData, site_number: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_restaurant_name">Nombre del Restaurante</Label>
                <Input
                  id="edit_restaurant_name"
                  value={formData.restaurant_name}
                  onChange={(e) => setFormData({...formData, restaurant_name: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Dirección</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Input
                    placeholder="Dirección"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Ciudad"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Provincia"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Código Postal"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_country">País</Label>
                <Input
                  id="edit_country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_restaurant_type">Tipo de Restaurante</Label>
                <Input
                  id="edit_restaurant_type"
                  value={formData.restaurant_type}
                  onChange={(e) => setFormData({...formData, restaurant_type: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_property_type">Tipo de Propiedad</Label>
                <Input
                  id="edit_property_type"
                  value={formData.property_type}
                  onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_autonomous_community">Comunidad Autónoma</Label>
                <Input
                  id="edit_autonomous_community"
                  value={formData.autonomous_community}
                  onChange={(e) => setFormData({...formData, autonomous_community: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_square_meters">Metros Cuadrados</Label>
                <Input
                  id="edit_square_meters"
                  type="number"
                  value={formData.square_meters}
                  onChange={(e) => setFormData({...formData, square_meters: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_seating_capacity">Capacidad de Asientos</Label>
                <Input
                  id="edit_seating_capacity"
                  type="number"
                  value={formData.seating_capacity}
                  onChange={(e) => setFormData({...formData, seating_capacity: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_opening_date">Fecha de Apertura</Label>
                <Input
                  id="edit_opening_date"
                  type="date"
                  value={formData.opening_date}
                  onChange={(e) => setFormData({...formData, opening_date: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {setIsEditModalOpen(false); setSelectedRestaurant(null); resetForm();}}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updating} className="bg-red-600 hover:bg-red-700">
                {updating ? 'Actualizando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

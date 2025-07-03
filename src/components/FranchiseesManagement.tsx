import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Building, Grid, List, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Franchisee } from '@/types/auth';
import { useFranchisees } from '@/hooks/useFranchisees';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FranchiseeCard } from './FranchiseeCard';
import { RestaurantAssignmentDialog } from './RestaurantAssignmentDialog';
import { useNavigate } from 'react-router-dom';
import { FranchiseeFiltersComponent } from './FranchiseeFilters';
import { useFranchiseeFilters } from '@/hooks/useFranchiseeFilters';

const ITEMS_PER_PAGE = 40;

export const FranchiseesManagement: React.FC = () => {
  const { franchisees, loading, error, refetch: onRefresh } = useFranchisees();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedFranchisee, setSelectedFranchisee] = useState<Franchisee | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Usar el hook de filtros
  const { filters, setFilters, filteredFranchisees, clearFilters } = useFranchiseeFilters(franchisees);

  const [formData, setFormData] = useState({
    franchisee_name: '',
    company_name: '',
    tax_id: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    email: '',
    phone: '',
    password: ''
  });

  console.log('FranchiseesManagement render - loading:', loading, 'error:', error, 'franchisees:', franchisees);

  // Cálculos de paginación con franquiciados filtrados
  const totalPages = Math.ceil(filteredFranchisees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFranchisees = filteredFranchisees.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const resetForm = () => {
    setFormData({
      franchisee_name: '',
      company_name: '',
      tax_id: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      email: '',
      phone: '',
      password: ''
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          full_name: formData.franchisee_name,
          role: 'franchisee'
        }
      });

      if (authError) {
        toast.error('Error al crear usuario: ' + authError.message);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            role: 'franchisee',
            full_name: formData.franchisee_name,
            phone: formData.phone
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        const { error: franchiseeError } = await supabase
          .from('franchisees')
          .insert({
            user_id: authData.user.id,
            franchisee_name: formData.franchisee_name,
            company_name: formData.company_name,
            tax_id: formData.tax_id,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code
          });

        if (franchiseeError) {
          console.error('Error creating franchisee:', franchiseeError);
          toast.error('Error al crear el franquiciado');
          return;
        }

        toast.success('Franquiciado creado exitosamente');
        setIsCreateModalOpen(false);
        resetForm();
        onRefresh();
      }
    } catch (error) {
      console.error('Error in handleCreate:', error);
      toast.error('Error al crear el franquiciado');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFranchisee) return;

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('franchisees')
        .update({
          franchisee_name: formData.franchisee_name,
          company_name: formData.company_name,
          tax_id: formData.tax_id,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code
        })
        .eq('id', selectedFranchisee.id);

      if (error) {
        toast.error('Error al actualizar el franquiciado');
        return;
      }

      toast.success('Franquiciado actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedFranchisee(null);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error in handleEdit:', error);
      toast.error('Error al actualizar el franquiciado');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (franchisee: Franchisee) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el franquiciado ${franchisee.franchisee_name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('franchisees')
        .delete()
        .eq('id', franchisee.id);

      if (error) {
        toast.error('Error al eliminar el franquiciado');
        return;
      }

      toast.success('Franquiciado eliminado exitosamente');
      onRefresh();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast.error('Error al eliminar el franquiciado');
    }
  };

  const openEditModal = (franchisee: Franchisee) => {
    setSelectedFranchisee(franchisee);
    setFormData({
      franchisee_name: franchisee.franchisee_name,
      company_name: franchisee.company_name || '',
      tax_id: franchisee.tax_id || '',
      address: franchisee.address || '',
      city: franchisee.city || '',
      state: franchisee.state || '',
      postal_code: franchisee.postal_code || '',
      email: '',
      phone: '',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const openAssignModal = (franchisee: Franchisee) => {
    setSelectedFranchisee(franchisee);
    setIsAssignModalOpen(true);
  };

  const handleViewDetails = (franchisee: Franchisee) => {
    navigate(`/advisor/franchisee/${franchisee.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          <span className="text-lg">Cargando franquiciados...</span>
          <p className="text-sm text-gray-500">Verificando conexión con la base de datos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-12 space-y-4">
        <Alert className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error al cargar franquiciados:</strong> {error}
          </AlertDescription>
        </Alert>
        <div className="flex space-x-2">
          <Button onClick={onRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Recargar página
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Franquiciados</h2>
          <p className="text-sm text-gray-500 mt-1">
            Mostrando {filteredFranchisees.length} de {franchisees.length} franquiciados
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Crear Franquiciado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Franquiciado</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="franchisee_name">Nombre del Franquiciado</Label>
                    <Input
                      id="franchisee_name"
                      value={formData.franchisee_name}
                      onChange={(e) => setFormData({...formData, franchisee_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_name">Nombre de la Empresa</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax_id">CIF/NIF</Label>
                    <Input
                      id="tax_id"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      minLength={6}
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
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => {setIsCreateModalOpen(false); resetForm();}}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating} className="bg-red-600 hover:bg-red-700">
                    {creating ? 'Creando...' : 'Crear Franquiciado'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sistema de filtros */}
      <FranchiseeFiltersComponent
        franchisees={franchisees}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {/* Contador de resultados y paginación para vista de tarjetas */}
      {viewMode === 'cards' && filteredFranchisees.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredFranchisees.length)} de {filteredFranchisees.length} franquiciados
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

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentFranchisees.map((franchisee) => (
            <FranchiseeCard
              key={franchisee.id}
              franchisee={franchisee}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onAssignRestaurant={openAssignModal}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Contador para vista de tabla */}
          {filteredFranchisees.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredFranchisees.length)} de {filteredFranchisees.length} franquiciados
              </div>
            </div>
          )}
          
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CIF/NIF</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentFranchisees.map((franchisee) => (
                  <TableRow 
                    key={franchisee.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewDetails(franchisee)}
                  >
                    <TableCell className="font-medium">{franchisee.franchisee_name}</TableCell>
                    <TableCell>{franchisee.company_name || '-'}</TableCell>
                    <TableCell>{franchisee.tax_id || '-'}</TableCell>
                    <TableCell>{franchisee.city || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            openAssignModal(franchisee);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Asignar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(franchisee);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(franchisee);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(franchisee);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación para vista de tabla */}
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
        </div>
      )}

      {filteredFranchisees.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron franquiciados
          </h3>
          <p className="text-gray-500 mb-4">
            Intenta ajustar los filtros para encontrar lo que buscas
          </p>
          <div className="flex justify-center space-x-2">
            <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Limpiar filtros
            </Button>
            <Button onClick={onRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Recargar datos
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Franquiciado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_franchisee_name">Nombre del Franquiciado</Label>
                <Input
                  id="edit_franchisee_name"
                  value={formData.franchisee_name}
                  onChange={(e) => setFormData({...formData, franchisee_name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_company_name">Nombre de la Empresa</Label>
                <Input
                  id="edit_company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_tax_id">CIF/NIF</Label>
                <Input
                  id="edit_tax_id"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
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
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {setIsEditModalOpen(false); setSelectedFranchisee(null); resetForm();}}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updating} className="bg-red-600 hover:bg-red-700">
                {updating ? 'Actualizando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Asignación de Restaurantes */}
      <RestaurantAssignmentDialog
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        selectedFranchisee={selectedFranchisee}
      />
    </div>
  );
};

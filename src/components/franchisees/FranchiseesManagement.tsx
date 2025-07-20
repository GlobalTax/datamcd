
import React, { useState } from 'react';
import { useAllFranchisees } from '@/hooks/useAllFranchisees';
import { useBaseRestaurants } from '@/hooks/useBaseRestaurants';
import { FranchiseeCard } from '@/components/FranchiseeCard';
import { RestaurantAssignmentDialog } from '@/components/RestaurantAssignmentDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, RefreshCw, Building2 } from 'lucide-react';
import { Franchisee } from '@/types/auth';

export const FranchiseesManagement = () => {
  const { franchisees, loading, refetch } = useAllFranchisees();
  const { restaurants: baseRestaurants } = useBaseRestaurants();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFranchisee, setSelectedFranchisee] = useState<Franchisee | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);

  const filteredFranchisees = franchisees.filter(franchisee =>
    franchisee.franchisee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchisee.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchisee.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignRestaurant = (franchisee: Franchisee) => {
    setSelectedFranchisee(franchisee);
    setShowAssignmentDialog(true);
  };

  const handleEditFranchisee = (franchisee: Franchisee) => {
    // TODO: Implementar modal de edición
    console.log('Edit franchisee:', franchisee);
  };

  const handleDeleteFranchisee = (franchisee: Franchisee) => {
    // TODO: Implementar confirmación y eliminación
    console.log('Delete franchisee:', franchisee);
  };

  // Calcular estadísticas
  const totalFranchisees = franchisees.length;
  const activeFranchisees = franchisees.filter(f => f.total_restaurants && f.total_restaurants > 0).length;
  const totalAssignedRestaurants = franchisees.reduce((sum, f) => sum + (f.total_restaurants || 0), 0);
  const unassignedRestaurants = baseRestaurants.length - totalAssignedRestaurants;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Gestión de Franquiciados</h2>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{totalFranchisees} franquiciados</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {activeFranchisees} activos
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Franquiciado
          </Button>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Total Franquiciados</h4>
              <p className="text-2xl font-bold text-blue-700">{totalFranchisees}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">Con Restaurantes</h4>
              <p className="text-2xl font-bold text-green-700">{activeFranchisees}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-purple-600" />
            <div>
              <h4 className="font-semibold text-purple-900">Restaurantes Asignados</h4>
              <p className="text-2xl font-bold text-purple-700">{totalAssignedRestaurants}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-orange-600" />
            <div>
              <h4 className="font-semibold text-orange-900">Sin Asignar</h4>
              <p className="text-2xl font-bold text-orange-700">{unassignedRestaurants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar franquiciados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid de franquiciados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFranchisees.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron franquiciados</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando un nuevo franquiciado'}
            </p>
          </div>
        ) : (
          filteredFranchisees.map((franchisee) => (
            <FranchiseeCard
              key={franchisee.id}
              franchisee={franchisee}
              onEdit={handleEditFranchisee}
              onDelete={handleDeleteFranchisee}
              onAssignRestaurant={handleAssignRestaurant}
            />
          ))
        )}
      </div>

      {/* Dialog de asignación de restaurantes */}
      <RestaurantAssignmentDialog
        isOpen={showAssignmentDialog}
        onClose={() => {
          setShowAssignmentDialog(false);
          setSelectedFranchisee(null);
        }}
        selectedFranchisee={selectedFranchisee}
      />
    </div>
  );
};

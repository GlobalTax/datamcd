
import React, { useState } from 'react';
import { useAllFranchisees } from '@/hooks/useAllFranchisees';
import { FranchiseeCard } from '@/components/FranchiseeCard';
import { FranchiseesTable } from './FranchiseesTable';
import { RestaurantAssignmentDialog } from '@/components/RestaurantAssignmentDialog';
import { UserCreationPanel } from '@/components/admin/UserCreationPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Search, RefreshCw, Building2, Grid, List, Shield } from 'lucide-react';
import { Franchisee } from '@/types/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const FranchiseesManagement = () => {
  const { user } = useAuth();
  const { franchisees, loading, refetch } = useAllFranchisees();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFranchisee, setSelectedFranchisee] = useState<Franchisee | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

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

  const handleViewDetails = (franchisee: Franchisee) => {
    navigate(`/advisor/franchisee/${franchisee.id}`);
  };

  // Verificar permisos del usuario
  if (!user || !['superadmin', 'admin'].includes(user.role)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No tienes permisos para gestionar franquiciados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular estadísticas
  const totalFranchisees = franchisees.length;
  const activeFranchisees = franchisees.filter(f => f.total_restaurants && f.total_restaurants > 0).length;
  const totalAssignedRestaurants = franchisees.reduce((sum, f) => sum + (f.total_restaurants || 0), 0);
  const franchiseesWithoutAccount = franchisees.filter(f => !f.user_id).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Panel de creación de usuarios para admins */}
      <UserCreationPanel />
      
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
            {franchiseesWithoutAccount > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {franchiseesWithoutAccount} sin cuenta
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
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
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-900">Sin Cuenta</h4>
              <p className="text-2xl font-bold text-yellow-700">{franchiseesWithoutAccount}</p>
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

      {/* Vista de contenido */}
      {viewMode === 'table' ? (
        <FranchiseesTable
          franchisees={filteredFranchisees}
          onEdit={handleEditFranchisee}
          onDelete={handleDeleteFranchisee}
          onAssignRestaurant={handleAssignRestaurant}
          onViewDetails={handleViewDetails}
        />
      ) : (
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
      )}

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

import React, { useState } from 'react';
import { useRestaurantMembers } from '@/hooks/useRestaurantMembers';
import { useRestaurantAccess } from '@/hooks/useRestaurantAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingFallback } from '@/components/common/LoadingFallback';
import { RestaurantAccessControl } from './RestaurantAccessControl';
import { AddMemberDialog } from './AddMemberDialog';
import { Users, MoreHorizontal, UserPlus, Search, Shield, UserX } from 'lucide-react';
import type { RestaurantMembersManagerProps, RestaurantRole } from '@/types/domains/restaurant/rbac';

const roleLabels: Record<RestaurantRole, string> = {
  owner: 'Propietario',
  manager: 'Gerente',
  staff: 'Personal',
  viewer: 'Visualizador'
};

const roleColors: Record<RestaurantRole, string> = {
  owner: 'bg-primary text-primary-foreground',
  manager: 'bg-orange-500 text-white',
  staff: 'bg-blue-500 text-white',
  viewer: 'bg-gray-500 text-white'
};

export const RestaurantMembersManager: React.FC<RestaurantMembersManagerProps> = ({
  restaurantId,
  showHeader = true,
  readOnly = false
}) => {
  const { canPerformAction } = useRestaurantAccess(restaurantId);
  const [filters, setFilters] = useState({ search: '', role: undefined as RestaurantRole | undefined });
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  
  const { 
    members, 
    loading, 
    updateMemberRole, 
    deactivateMember, 
    reactivateMember,
    removeMember 
  } = useRestaurantMembers(restaurantId, filters);

  const handleRoleChange = async (memberId: string, newRole: RestaurantRole) => {
    await updateMemberRole(memberId, newRole);
  };

  const handleDeactivate = async (memberId: string) => {
    await deactivateMember(memberId);
  };

  const handleReactivate = async (memberId: string) => {
    await reactivateMember(memberId);
  };

  const handleRemove = async (memberId: string) => {
    if (confirm('¿Estás seguro de eliminar este miembro? Esta acción no se puede deshacer.')) {
      await removeMember(memberId);
    }
  };

  if (loading) {
    return <LoadingFallback />;
  }

  const canManageMembers = canPerformAction('edit') && !readOnly;

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Miembros del Restaurante</h2>
            <p className="text-muted-foreground">
              Gestiona los usuarios que tienen acceso a este restaurante
            </p>
          </div>
          
          <RestaurantAccessControl restaurantId={restaurantId} requiredRole="manager">
            <Button onClick={() => setShowAddMemberDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Miembro
            </Button>
          </RestaurantAccessControl>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={filters.role || ''}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                role: value ? value as RestaurantRole : undefined 
              }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los roles</SelectItem>
                {Object.entries(roleLabels).map(([role, label]) => (
                  <SelectItem key={role} value={role}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de miembros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Miembros ({members.length})
          </CardTitle>
          <CardDescription>
            Lista de usuarios con acceso a este restaurante
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron miembros</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {(member.user?.full_name || member.user?.email || '').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium">
                        {member.user?.full_name || member.user?.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.user?.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Asignado: {new Date(member.assigned_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={roleColors[member.role]}>
                      {roleLabels[member.role]}
                    </Badge>

                    {!member.is_active && (
                      <Badge variant="secondary">
                        <UserX className="h-3 w-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}

                    {canManageMembers && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, 'owner')}
                            disabled={member.role === 'owner'}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Hacer Propietario
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, 'manager')}
                            disabled={member.role === 'manager'}
                          >
                            Hacer Gerente
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, 'staff')}
                            disabled={member.role === 'staff'}
                          >
                            Hacer Personal
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, 'viewer')}
                            disabled={member.role === 'viewer'}
                          >
                            Hacer Visualizador
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {member.is_active ? (
                            <DropdownMenuItem
                              onClick={() => handleDeactivate(member.id)}
                              className="text-orange-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Desactivar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleReactivate(member.id)}
                              className="text-green-600"
                            >
                              Reactivar
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem
                            onClick={() => handleRemove(member.id)}
                            className="text-destructive"
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para agregar miembro */}
      <AddMemberDialog
        restaurantId={restaurantId}
        open={showAddMemberDialog}
        onOpenChange={setShowAddMemberDialog}
        onMemberAdded={() => {
          // El hook se recarga automáticamente
        }}
      />
    </div>
  );
};
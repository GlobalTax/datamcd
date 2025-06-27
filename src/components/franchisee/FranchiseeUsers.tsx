
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/types/auth';

interface FranchiseeUsersProps {
  franchiseeId: string;
  franchiseeName: string;
}

export interface FranchiseeUsersRef {
  refresh: () => void;
}

export const FranchiseeUsers = forwardRef<FranchiseeUsersRef, FranchiseeUsersProps>(({ 
  franchiseeId, 
  franchiseeName 
}, ref) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFranchiseeUsers = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching users for franchisee:', franchiseeId, franchiseeName);
      
      // Obtener el usuario directo del franquiciado
      const { data: franchiseeData, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('user_id')
        .eq('id', franchiseeId)
        .maybeSingle();

      if (franchiseeError) {
        console.error('Error fetching franchisee:', franchiseeError);
        toast.error('Error al cargar el franquiciado');
        return;
      }

      let userIds: string[] = [];
      
      // Incluir el usuario asociado directamente al franquiciado si existe
      if (franchiseeData?.user_id) {
        userIds.push(franchiseeData.user_id);
      }

      // Buscar usuarios que podrían estar relacionados con este franquiciado
      // por nombre o email similar
      const { data: relatedProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${franchiseeName}%,email.ilike.%${franchiseeName.toLowerCase()}%`);

      if (profilesError) {
        console.error('Error fetching related profiles:', profilesError);
      } else if (relatedProfiles) {
        relatedProfiles.forEach(profile => {
          if (!userIds.includes(profile.id)) {
            userIds.push(profile.id);
          }
        });
      }

      // Obtener perfiles completos de todos los usuarios identificados
      if (userIds.length > 0) {
        const { data: userProfiles, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)
          .order('created_at', { ascending: false });

        if (usersError) {
          console.error('Error fetching user profiles:', usersError);
          toast.error('Error al cargar los usuarios');
          return;
        }

        const typedUsers = (userProfiles || []).map(userData => ({
          ...userData,
          role: userData.role as 'admin' | 'franchisee' | 'manager' | 'asesor' | 'asistente' | 'superadmin'
        }));

        console.log('Found users for franchisee:', typedUsers);
        setUsers(typedUsers);
      } else {
        console.log('No users found for franchisee');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error in fetchFranchiseeUsers:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchFranchiseeUsers
  }));

  useEffect(() => {
    fetchFranchiseeUsers();
  }, [franchiseeId]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${userName}?`)) {
      return;
    }

    try {
      // Eliminar perfil (esto también eliminará el usuario de auth por cascade)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        toast.error('Error al eliminar usuario');
        return;
      }

      toast.success('Usuario eliminado exitosamente');
      fetchFranchiseeUsers();
    } catch (error) {
      console.error('Error in handleDeleteUser:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'franchisee':
        return 'bg-green-100 text-green-800';
      case 'asesor':
        return 'bg-purple-100 text-purple-800';
      case 'asistente':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'superadmin':
        return 'Super Admin';
      case 'manager':
        return 'Gerente';
      case 'franchisee':
        return 'Franquiciado';
      case 'asesor':
        return 'Asesor';
      case 'asistente':
        return 'Asistente';
      default:
        return role;
    }
  };

  // Solo admins pueden gestionar usuarios
  if (!user || !['admin', 'asesor', 'superadmin'].includes(user.role)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuarios Asociados ({users.length})
          </CardTitle>
          <Button
            onClick={fetchFranchiseeUsers}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p>Cargando usuarios...</p>
          </div>
        ) : users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem.id}>
                  <TableCell className="font-medium">
                    {userItem.full_name || 'Sin nombre'}
                  </TableCell>
                  <TableCell>{userItem.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(userItem.role)}>
                      {getRoleLabel(userItem.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(userItem.created_at || '').toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    {userItem.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(userItem.id, userItem.full_name || userItem.email)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay usuarios asociados</h3>
            <p className="text-gray-600">
              Crea un nuevo usuario usando el panel de arriba para asociarlo a este franquiciado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

FranchiseeUsers.displayName = 'FranchiseeUsers';


import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
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
  const { user } = useUnifiedAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para limpiar nombres y evitar caracteres problemáticos en consultas
  const sanitizeSearchTerm = (term: string): string => {
    if (!term) return '';
    // Remover caracteres que pueden romper las consultas SQL
    return term.replace(/[,;()]/g, ' ').trim();
  };

  const fetchFranchiseeUsers = async () => {
    try {
      setLoading(true);
      
      console.log('DEBUG: Fetching users for franchisee:', {
        franchiseeId,
        franchiseeName,
        userRole: user?.role
      });
      
      let userIds: string[] = [];
      
      // 1. Obtener el usuario directo del franquiciado
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

      if (franchiseeData?.user_id) {
        userIds.push(franchiseeData.user_id);
        console.log('DEBUG: Added direct franchisee user:', franchiseeData.user_id);
      }

      // 2. Buscar usuarios staff asociados al franquiciado
      const { data: staffUsers, error: staffError } = await supabase
        .from('franchisee_staff')
        .select('user_id')
        .eq('franchisee_id', franchiseeId);

      if (staffError) {
        console.error('Error fetching staff users:', staffError);
      } else if (staffUsers) {
        staffUsers.forEach(staff => {
          if (staff.user_id && !userIds.includes(staff.user_id)) {
            userIds.push(staff.user_id);
          }
        });
        console.log('DEBUG: Added staff users:', staffUsers.length);
      }

      // 3. Solo buscar por nombre si no encontramos usuarios y es necesario
      if (userIds.length === 0 && franchiseeName) {
        console.log('DEBUG: No direct users found, searching by name parts');
        
        // Dividir el nombre en palabras de al menos 3 caracteres
        const searchTerms = franchiseeName
          .toLowerCase()
          .split(/[\s,]+/) // Dividir por espacios y comas
          .filter(term => term.length >= 3)
          .slice(0, 3); // Máximo 3 términos para evitar consultas muy complejas

        console.log('DEBUG: Search terms:', searchTerms);

        for (const term of searchTerms) {
          const cleanTerm = term.replace(/[^\w\s]/g, ''); // Remover caracteres especiales
          
          if (cleanTerm.length >= 3) {
            const { data: relatedProfiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .ilike('full_name', `%${cleanTerm}%`)
              .limit(10); // Limitar resultados

            if (!profilesError && relatedProfiles) {
              console.log(`DEBUG: Found ${relatedProfiles.length} profiles matching "${cleanTerm}"`);
              relatedProfiles.forEach(profile => {
                if (!userIds.includes(profile.id)) {
                  userIds.push(profile.id);
                }
              });
            } else if (profilesError) {
              console.error('Error searching profiles by name:', profilesError);
            }
          }
        }
      }

      // 4. Obtener perfiles completos
      console.log('DEBUG: Final user IDs to fetch:', userIds);
      
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
          role: userData.role as 'admin' | 'franchisee' | 'staff' | 'superadmin' | 'asesor'
        }));

        console.log('DEBUG: Final users found:', typedUsers);
        setUsers(typedUsers);
      } else {
        console.log('DEBUG: No users found for franchisee');
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
      case 'asesor':
        return 'bg-purple-100 text-purple-800';
      case 'franchisee':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
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
      case 'asesor':
        return 'Asesor';
      case 'franchisee':
        return 'Franquiciado';
      case 'staff':
        return 'Personal';
      default:
        return role;
    }
  };

  // Solo admins y asesores pueden gestionar usuarios
  if (!user || !['admin', 'superadmin', 'asesor'].includes(user.role)) {
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

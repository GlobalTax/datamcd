
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Shield, RefreshCw } from 'lucide-react';
import { UserCreationPanel } from '@/components/admin/UserCreationPanel';
import { toast } from 'sonner';
import { User } from '@/types/auth';

export const AdministratorManagement = () => {
  const { user } = useAuth();
  const [administrators, setAdministrators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdministrators();
  }, []);

  const fetchAdministrators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'superadmin'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching administrators:', error);
        toast.error('Error al cargar administradores');
        return;
      }

      const typedAdministrators = (data || []).map(adminData => ({
        ...adminData,
        role: adminData.role as 'admin' | 'superadmin'
      }));

      setAdministrators(typedAdministrators);
    } catch (error) {
      console.error('Error in fetchAdministrators:', error);
      toast.error('Error al cargar administradores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdministrator = async (adminId: string, adminName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el administrador ${adminName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', adminId);

      if (error) {
        console.error('Error deleting administrator:', error);
        toast.error('Error al eliminar administrador');
        return;
      }

      toast.success('Administrador eliminado exitosamente');
      fetchAdministrators();
    } catch (error) {
      console.error('Error in handleDeleteAdministrator:', error);
      toast.error('Error al eliminar administrador');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const canDeleteAdministrator = (adminRole: string) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'admin' && adminRole === 'admin') return true;
    return false;
  };

  if (!user || !['superadmin', 'admin'].includes(user.role)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No tienes permisos para gestionar administradores</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <UserCreationPanel />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Lista de Administradores
            </CardTitle>
            <Button
              onClick={fetchAdministrators}
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
              <p>Cargando administradores...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {administrators.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.full_name || 'Sin nombre'}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(admin.role)}>
                        {getRoleLabel(admin.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {admin.id !== user?.id && canDeleteAdministrator(admin.role) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAdministrator(admin.id, admin.full_name || admin.email)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

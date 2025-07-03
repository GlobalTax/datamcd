
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

const AdvisorManagement = () => {
  const { user } = useAuth();
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'asesor', 'superadmin'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching advisors:', error);
        toast.error('Error al cargar asesores');
        return;
      }

      // Mantener los roles como están en la base de datos
      const typedAdvisors = (data || []).map(advisorData => ({
        ...advisorData,
        role: advisorData.role as 'admin' | 'asesor' | 'superadmin'
      }));

      setAdvisors(typedAdvisors);
    } catch (error) {
      console.error('Error in fetchAdvisors:', error);
      toast.error('Error al cargar asesores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdvisor = async (advisorId: string, advisorName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el asesor ${advisorName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', advisorId);

      if (error) {
        console.error('Error deleting advisor:', error);
        toast.error('Error al eliminar asesor');
        return;
      }

      toast.success('Asesor eliminado exitosamente');
      fetchAdvisors();
    } catch (error) {
      console.error('Error in handleDeleteAdvisor:', error);
      toast.error('Error al eliminar asesor');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'asesor':
        return 'bg-purple-100 text-purple-800';
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
      case 'asesor':
        return 'Asesor';
      default:
        return role;
    }
  };

  const canDeleteAdvisor = (advisorRole: string) => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'admin' && advisorRole === 'asesor') return true;
    return false;
  };

  if (!user || !['superadmin', 'admin', 'asesor'].includes(user.role)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No tienes permisos para gestionar asesores</p>
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
              Lista de Asesores
            </CardTitle>
            <Button
              onClick={fetchAdvisors}
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
              <p>Cargando asesores...</p>
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
                {advisors.map((advisor) => (
                  <TableRow key={advisor.id}>
                    <TableCell className="font-medium">
                      {advisor.full_name || 'Sin nombre'}
                    </TableCell>
                    <TableCell>{advisor.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(advisor.role)}>
                        {getRoleLabel(advisor.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(advisor.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {advisor.id !== user?.id && canDeleteAdvisor(advisor.role) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAdvisor(advisor.id, advisor.full_name || advisor.email)}
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

export default AdvisorManagement;

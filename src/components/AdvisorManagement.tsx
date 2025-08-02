
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Shield, RefreshCw } from 'lucide-react';
import { UserCreationPanel } from '@/components/admin/UserCreationPanel';
import { toast } from 'sonner';
import { advisorService } from '@/services/advisor/AdvisorService';
import type { User } from '@/types/domains/auth';

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
      const response = await advisorService.getAdvisors();
      
      if (!response.success || !response.data) {
        toast.error(response.error || 'Error al cargar administradores');
        return;
      }

      setAdvisors(response.data);
    } catch (error) {
      toast.error('Error al cargar administradores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdvisor = async (advisorId: string, advisorName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el administrador ${advisorName}?`)) {
      return;
    }

    try {
      const response = await advisorService.deleteAdvisor(advisorId, advisorName);
      
      if (!response.success) {
        toast.error(response.error || 'Error al eliminar administrador');
        return;
      }

      toast.success('Administrador eliminado exitosamente');
      fetchAdvisors();
    } catch (error) {
      toast.error('Error al eliminar administrador');
    }
  };

  // Simplificado: usar lógica de permisos del servicio
  const canDeleteAdvisor = (advisorRole: string) => {
    return advisorService.canDeleteAdvisor(user?.role || 'franchisee', advisorRole);
  };

  if (!user) {
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
                {advisors.map((advisor) => (
                  <TableRow key={advisor.id}>
                    <TableCell className="font-medium">
                      {advisor.full_name || 'Sin nombre'}
                    </TableCell>
                    <TableCell>{advisor.email}</TableCell>
                    <TableCell>
                      <Badge variant={advisorService.getRoleBadgeVariant(advisor.role)}>
                        {advisorService.getRoleLabel(advisor.role)}
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

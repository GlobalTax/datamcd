import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const FranchiseeUsers = ({ franchiseeId }: { franchiseeId: string }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('franchisee_id', franchiseeId);

      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Error al cargar los usuarios del franquiciado');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        
        showSuccess('Usuario eliminado correctamente');
      } else if (action === 'disable') {
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('id', userId);

        if (error) throw error;
        
        showSuccess('Usuario desactivado correctamente');
      } else if (action === 'enable') {
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: true })
          .eq('id', userId);

        if (error) throw error;
        
        showSuccess('Usuario activado correctamente');
      } else {
        showError('Acción no válida');
        return;
      }
      
      await fetchUsers();
    } catch (error) {
      console.error(`Error in ${action}:`, error);
      showError(`Error al ejecutar la acción ${action}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [franchiseeId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios del Franquiciado</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.is_active ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'disable')}
                            className="mr-2"
                          >
                            Desactivar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'delete')}
                          >
                            Eliminar
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'enable')}
                        >
                          Activar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FranchiseeUsers;

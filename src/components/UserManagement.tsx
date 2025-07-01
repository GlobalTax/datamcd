import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserCreation } from '@/hooks/useUserCreation';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { showSuccess, showError } from '@/utils/notifications';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

const UserManagement = () => {
  const { createUser, inviteUser, loading: creationLoading } = useUserCreation();
  const { deleteUser, softDeleteUser, loading: deleteLoading } = useDeleteUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      // Assuming there's a supabase client or API to fetch users
      const response = await fetch('/api/users'); // Replace with actual fetch logic
      if (!response.ok) {
        throw new Error('Error fetching users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Error al cargar los usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData: { email: string; password: string; fullName: string; role: string }) => {
    try {
      const success = await createUser(userData);
      if (success) {
        showSuccess('Usuario creado correctamente');
        await fetchUsers();
      }
    } catch (error) {
      showError('Error al crear el usuario');
    }
  };

  const handleInviteUser = async (inviteData: { email: string; fullName: string; role: string }) => {
    try {
      const success = await inviteUser(inviteData);
      if (success) {
        showSuccess('Invitación enviada correctamente');
        await fetchUsers();
      }
    } catch (error) {
      showError('Error al enviar la invitación');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const success = await deleteUser(userId);
      if (success) {
        showSuccess('Usuario eliminado correctamente');
        await fetchUsers();
      }
    } catch (error) {
      showError('Error al eliminar el usuario');
    }
  };

  const handleSoftDeleteUser = async (userId: string) => {
    try {
      const success = await softDeleteUser(userId);
      if (success) {
        showSuccess('Usuario desactivado correctamente');
        await fetchUsers();
      }
    } catch (error) {
      showError('Error al desactivar el usuario');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingUsers ? (
          <p>Cargando usuarios...</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Email</th>
                <th className="border-b p-2">Nombre Completo</th>
                <th className="border-b p-2">Rol</th>
                <th className="border-b p-2">Activo</th>
                <th className="border-b p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.full_name || '-'}</td>
                  <td className="p-2">{user.role || '-'}</td>
                  <td className="p-2">{user.is_active ? 'Sí' : 'No'}</td>
                  <td className="p-2 space-x-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteLoading}
                    >
                      Eliminar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSoftDeleteUser(user.id)}
                      disabled={deleteLoading}
                    >
                      Desactivar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Additional UI for creating or inviting users can be added here */}
      </CardContent>
    </Card>
  );
};

export default UserManagement;

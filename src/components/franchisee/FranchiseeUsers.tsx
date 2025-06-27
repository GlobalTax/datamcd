
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/AuthProvider';
import { useFranchiseeUsers } from '@/hooks/useFranchiseeUsers';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { toast } from 'sonner';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FranchiseeUsersProps {
  franchiseeId: string;
  franchiseeName?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

export const FranchiseeUsers = ({ franchiseeId, franchiseeName }: FranchiseeUsersProps) => {
  const { user } = useAuth();
  const { users, loading, error, refetch } = useFranchiseeUsers(franchiseeId);
  const { deleteUser, deleting } = useDeleteUser();
  const navigate = useNavigate();
  const [userToDelete, setUserToDelete] = useState<{ userId: string; userName: string } | null>(null);

  const handleDeleteConfirmation = (userId: string, userName: string) => {
    setUserToDelete({ userId, userName });
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    const success = await deleteUser(franchiseeId, userToDelete.userId, userToDelete.userName);
    if (success) {
      refetch(); // Recargar la lista de usuarios
    }
    setUserToDelete(null); // Limpiar el estado
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p>Cargando usuarios...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p>Error al cargar usuarios: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios del Franquiciado</CardTitle>
      </CardHeader>
      <CardContent>
        {users && users.length > 0 ? (
          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.full_name || 'Usuario sin nombre'}</p>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará el acceso del usuario al franquiciado.
                          Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deleting}
                          onClick={() => {
                            handleDeleteConfirmation(user.id, user.full_name || user.email);
                            handleConfirmDelete();
                          }}
                        >
                          {deleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay usuarios asignados a este franquiciado.</p>
        )}
      </CardContent>
    </Card>
  );
};

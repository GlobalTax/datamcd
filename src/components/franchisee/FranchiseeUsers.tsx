
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';
import { Trash2, Plus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface FranchiseeUsersProps {
  franchiseeId: string;
  franchiseeName: string;
}

export const FranchiseeUsers: React.FC<FranchiseeUsersProps> = ({ franchiseeId, franchiseeName }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'franchisee');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!newUserEmail.trim() || !newUserName.trim()) {
      showError('Por favor completa todos los campos');
      return;
    }

    try {
      setInviting(true);
      
      // Create invitation
      const { error: inviteError } = await supabase
        .from('franchisee_invitations')
        .insert({
          email: newUserEmail,
          franchisee_id: franchiseeId,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (inviteError) throw inviteError;

      showSuccess('Invitación enviada correctamente');
      setNewUserEmail('');
      setNewUserName('');
    } catch (error) {
      console.error('Error inviting user:', error);
      showError('Error al enviar la invitación');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'inactive' })
        .eq('id', userId);

      if (error) throw error;

      showSuccess('Usuario desactivado correctamente');
      await fetchUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      showError('Error al desactivar el usuario');
    }
  };

  const refresh = () => {
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [franchiseeId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invitar Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
          </div>
          <Button onClick={handleInviteUser} disabled={inviting}>
            <Plus className="w-4 h-4 mr-2" />
            {inviting ? 'Enviando...' : 'Enviar Invitación'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Franquiciado</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : (
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay usuarios asignados</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.full_name || 'Sin nombre'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <Badge variant="secondary" className="mt-1">
                        {user.role}
                      </Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserCreation } from '@/hooks/useUserCreation';
import { showSuccess, showError } from '@/utils/notifications';

interface CreateUserData {
  email: string;
  password?: string;
  fullName: string;
  role: string;
}

interface InviteUserData {
  email: string;
  fullName: string;
  role: string;
}

const UserCreationPanel = () => {
  const { createUser, inviteUser, loading } = useUserCreation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'franchisee'
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.email || !formData.password || !formData.fullName) {
        showError('Por favor completa todos los campos');
        return;
      }

      const success = await createUser(formData);
      if (success) {
        setFormData({ email: '', password: '', fullName: '', role: 'franchisee' });
        showSuccess('Usuario creado correctamente');
      }
    } catch (error) {
      showError('Error al crear el usuario');
    }
  };

  const handleInviteUser = async () => {
    try {
      if (!formData.email || !formData.fullName) {
        showError('Por favor completa email y nombre completo');
        return;
      }

      const success = await inviteUser({
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role
      });
      
      if (success) {
        setFormData({ email: '', password: '', fullName: '', role: 'franchisee' });
        showSuccess('Invitación enviada correctamente');
      }
    } catch (error) {
      showError('Error al enviar la invitación');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Rol</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="franchisee">Franquiciado</SelectItem>
                <SelectItem value="asesor">Asesor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">SuperAdmin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleInviteUser} disabled={loading}>
              {loading ? 'Enviando...' : 'Invitar Usuario'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserCreationPanel;

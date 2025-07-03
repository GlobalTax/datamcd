
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserCreation } from '@/hooks/useUserCreation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserCreationPanelProps {
  onUserCreated?: () => void;
}

export const UserCreationPanel: React.FC<UserCreationPanelProps> = ({ onUserCreated }) => {
  const { user } = useAuth();
  const { createUser, creating } = useUserCreation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    const success = await createUser(
      formData.email,
      formData.password,
      formData.fullName,
      formData.role as any
    );
    
    if (success) {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: ''
      });
      // Notificar al componente padre que se creó un usuario
      onUserCreated?.();
    }
  };

  const canCreateUser = user?.role === 'admin' || user?.role === 'superadmin';
  
  if (!canCreateUser) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Crear Nuevo Usuario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nombre completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol..." />
                </SelectTrigger>
                <SelectContent>
                  {user?.role === 'superadmin' && (
                    <>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="asesor">Asesor</SelectItem>
                      <SelectItem value="franchisee">Franquiciado</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="asistente">Asistente</SelectItem>
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <SelectItem value="asesor">Asesor</SelectItem>
                      <SelectItem value="franchisee">Franquiciado</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="asistente">Asistente</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={creating}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando usuario...
              </>
            ) : (
              'Crear Usuario'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { useUserCreation } from '@/hooks/useUserCreation';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
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
  const { canManageUsers, isAdmin, isSuperAdmin } = useSecurityValidation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: ''
  });
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

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

  // Determine available roles based on current user's role
  useEffect(() => {
    if (!user) return;
    
    const userRole = user.role;
    if (userRole === 'superadmin') {
      setAvailableRoles(['admin', 'franchisee', 'staff']);
    } else if (userRole === 'admin') {
      setAvailableRoles(['franchisee', 'staff']);
    } else {
      setAvailableRoles([]);
    }
  }, [user]);

  // Security check - only admins and superadmins can create users
  if (!canManageUsers()) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tienes permisos para crear usuarios</p>
          </div>
        </CardContent>
      </Card>
    );
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
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
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
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === 'admin' ? 'Administrador' :
                       role === 'franchisee' ? 'Franquiciado' :
                       role === 'staff' ? 'Personal' : role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
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
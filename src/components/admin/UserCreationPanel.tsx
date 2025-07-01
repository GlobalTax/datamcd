
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserCreation } from '@/hooks/useUserCreation';
import { Plus } from 'lucide-react';

interface UserCreationPanelProps {
  onUserCreated?: () => void;
}

export default function UserCreationPanel({ onUserCreated }: UserCreationPanelProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('franchisee');
  const [creationMode, setCreationMode] = useState<'create' | 'invite'>('invite');
  const [password, setPassword] = useState('');

  const { loading, createUser, inviteUser } = useUserCreation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    if (creationMode === 'create') {
      success = await createUser({ email, password, fullName, role });
    } else {
      success = await inviteUser({ email, fullName, role });
    }

    if (success) {
      setEmail('');
      setFullName('');
      setPassword('');
      setRole('franchisee');
      onUserCreated?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Crear Nuevo Usuario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant={creationMode === 'invite' ? 'default' : 'outline'}
              onClick={() => setCreationMode('invite')}
              size="sm"
            >
              Invitar Usuario
            </Button>
            <Button
              type="button"
              variant={creationMode === 'create' ? 'default' : 'outline'}
              onClick={() => setCreationMode('create')}
              size="sm"
            >
              Crear Directamente
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {creationMode === 'create' && (
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="role">Rol</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="franchisee">Franquiciado</SelectItem>
                  <SelectItem value="asesor">Asesor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading 
              ? (creationMode === 'create' ? 'Creando...' : 'Enviando invitación...') 
              : (creationMode === 'create' ? 'Crear Usuario' : 'Enviar Invitación')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

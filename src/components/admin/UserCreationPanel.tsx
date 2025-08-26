import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/contexts/auth';
import { useUserCreation } from '@/hooks/useUserCreation';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2, RefreshCw, Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface UserCreationPanelProps {
  onUserCreated?: () => void;
}

export const UserCreationPanel: React.FC<UserCreationPanelProps> = ({ onUserCreated }) => {
  const { user } = useUnifiedAuth();
  const { createUser, creating } = useUserCreation();
  const { canManageUsers, isAdmin, isSuperAdmin } = useSecurityValidation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: ''
  });
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    fullName: string;
    role: string;
  } | null>(null);
  const [sendInvitationEmail, setSendInvitationEmail] = useState(true);

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
      // Mostrar las credenciales creadas
      setCreatedCredentials({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role
      });
      
      // Limpiar el formulario
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

  // Generar contraseña temporal automática
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Asegurar que tiene mayúscula, minúscula, número y símbolo
    return password + 'A1!';
  };

  // Copiar credenciales al portapapeles
  const copyCredentials = () => {
    if (!createdCredentials) return;
    
    const text = `Credenciales de acceso:
Email: ${createdCredentials.email}
Contraseña temporal: ${createdCredentials.password}
Nombre: ${createdCredentials.fullName}
Rol: ${createdCredentials.role}

Portal: ${window.location.origin}/auth
IMPORTANTE: Deberás cambiar la contraseña en el primer acceso.`;
    
    navigator.clipboard.writeText(text);
    toast.success('Credenciales copiadas al portapapeles');
  };

  // Cerrar modal de credenciales
  const closeCredentialsModal = () => {
    setCreatedCredentials(null);
  };

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
              <Label htmlFor="password">Contraseña Temporal</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Se generará automáticamente"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFormData(prev => ({ ...prev, password: generateTempPassword() }))}
                  title="Generar contraseña automática"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
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

          <div className="flex items-center space-x-2">
            <input
              id="sendEmail"
              type="checkbox"
              checked={sendInvitationEmail}
              onChange={(e) => setSendInvitationEmail(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="sendEmail" className="text-sm">
              Enviar email de invitación automáticamente
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={creating}
            onClick={(e) => {
              // Auto-generar contraseña si está vacía
              if (!formData.password) {
                setFormData(prev => ({ ...prev, password: generateTempPassword() }));
              }
            }}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando usuario...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Usuario e Invitar
              </>
            )}
          </Button>
        </form>
      </CardContent>
      
      {/* Modal de credenciales creadas */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <UserPlus className="w-5 h-5" />
                Usuario Creado Exitosamente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div><strong>Nombre:</strong> {createdCredentials.fullName}</div>
                  <div><strong>Email:</strong> {createdCredentials.email}</div>
                  <div><strong>Contraseña temporal:</strong> 
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      {createdCredentials.password}
                    </code>
                  </div>
                  <div><strong>Rol:</strong> {createdCredentials.role}</div>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Importante:</strong> El usuario deberá cambiar esta contraseña en su primer acceso.
                  Guarda estas credenciales en un lugar seguro.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={copyCredentials}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Datos
                </Button>
                <Button 
                  onClick={closeCredentialsModal}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};
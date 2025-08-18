import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { useRestaurantMembers } from '@/hooks/useRestaurantMembers';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useProfileCreation } from '@/hooks/useProfileCreation';
import { useUserCreation } from '@/hooks/useUserCreation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingFallback } from '@/components/common/LoadingFallback';
import { UserPlus, Search, UserCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AddMemberDialogProps, RestaurantRole } from '@/types/domains/restaurant/rbac';

const roleLabels: Record<RestaurantRole, string> = {
  owner: 'Propietario',
  manager: 'Gerente', 
  staff: 'Personal',
  viewer: 'Visualizador'
};

const roleDescriptions: Record<RestaurantRole, string> = {
  owner: 'Acceso completo a todas las funciones',
  manager: 'Gestión de empleados, informes y configuración',
  staff: 'Acceso a funciones básicas de operación',
  viewer: 'Solo lectura de informes y datos'
};

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  restaurantId,
  open,
  onOpenChange,
  onMemberAdded
}) => {
  const { user } = useAuth();
  const { addMember } = useRestaurantMembers(restaurantId);
  const { searchUsers, searchResults, searching, clearResults } = useUserSearch();
  const { createProfile } = useProfileCreation();
  const { createUser, creating } = useUserCreation();

  const [step, setStep] = useState<'search' | 'create' | 'assign'>('search');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<RestaurantRole>('staff');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) return;
    await searchUsers(email.trim());
  };

  const handleSelectUser = (foundUser: any) => {
    setSelectedUser(foundUser);
    setFullName(foundUser.full_name || '');
    setStep('assign');
  };

  const handleCreateNew = () => {
    setStep('create');
    clearResults();
  };

  const handleCreateProfile = async () => {
    if (!email || !fullName) return;

    // Use createUser from useUserCreation for consistent user creation with restaurant assignment
    const success = await createUser(
      email.trim(),
      // Generate a temporary password - in a real app you'd want to handle this differently
      Math.random().toString(36).slice(-8) + 'A1!',
      fullName.trim(),
      'staff',
      undefined, // No franchisee
      restaurantId // Directly assign to restaurant
    );

    if (success) {
      // The user was created and assigned to the restaurant via the edge function
      // Now we need to get the user data to proceed with role assignment in the UI
      const newUser = {
        id: 'temp-id', // Will be replaced when we search
        email: email.trim(),
        full_name: fullName.trim(),
        role: 'staff'
      };
      
      setSelectedUser(newUser);
      setStep('assign');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    setIsSubmitting(true);
    try {
      const success = await addMember(selectedUser.id, selectedRole);
      if (success) {
        onMemberAdded?.();
        handleClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('search');
    setEmail('');
    setFullName('');
    setSelectedRole('staff');
    setSelectedUser(null);
    clearResults();
    onOpenChange(false);
  };

  const renderSearchStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email del usuario</Label>
        <div className="flex gap-2">
          <Input
            id="email"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching || !email.trim()}>
            {searching ? <LoadingFallback /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <Label>Usuarios encontrados</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((foundUser) => (
              <div
                key={foundUser.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleSelectUser(foundUser)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {(foundUser.full_name || foundUser.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{foundUser.full_name || foundUser.email}</div>
                    <div className="text-sm text-muted-foreground">{foundUser.email}</div>
                  </div>
                </div>
                <Badge variant="outline">{foundUser.role}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && email && !searching && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se encontró un usuario con ese email. 
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal underline"
              onClick={handleCreateNew}
            >
              ¿Crear nuevo usuario?
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderCreateStep = () => (
    <div className="space-y-4">
      <Alert>
        <UserPlus className="h-4 w-4" />
        <AlertDescription>
          Se creará un nuevo perfil de usuario con el email: <strong>{email}</strong>
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nombre y apellidos"
        />
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setStep('search')}
          className="flex-1"
        >
          Volver
        </Button>
        <Button 
          onClick={handleCreateProfile}
          disabled={creating || !fullName.trim()}
          className="flex-1"
        >
          {creating ? <LoadingFallback /> : 'Crear Usuario'}
        </Button>
      </div>
    </div>
  );

  const renderAssignStep = () => (
    <div className="space-y-4">
      <Alert>
        <UserCheck className="h-4 w-4" />
        <AlertDescription>
          Asignar rol a: <strong>{selectedUser?.full_name || selectedUser?.email}</strong>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>Rol en el restaurante</Label>
        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as RestaurantRole)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roleLabels).map(([role, label]) => (
              <SelectItem key={role} value={role}>
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">
                    {roleDescriptions[role as RestaurantRole]}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setStep('search')}
          className="flex-1"
        >
          Volver
        </Button>
        <Button 
          onClick={handleAssignRole}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? <LoadingFallback /> : 'Asignar Rol'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Agregar Miembro al Restaurante
          </DialogTitle>
          <DialogDescription>
            {step === 'search' && 'Busca un usuario existente o crea uno nuevo'}
            {step === 'create' && 'Completa la información del nuevo usuario'}
            {step === 'assign' && 'Asigna un rol para el restaurante'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'search' && renderSearchStep()}
          {step === 'create' && renderCreateStep()}
          {step === 'assign' && renderAssignStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
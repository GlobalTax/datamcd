import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { 
  RefreshCw, 
  UserPlus, 
  Mail, 
  Shield,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  created_at: string;
  last_sign_in?: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'franchisee',
    full_name: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    try {
      // En un sistema real, esto sería a través de una Edge Function
      // que envíe invitaciones por email
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(
        inviteForm.email,
        {
          data: {
            full_name: inviteForm.full_name,
            role: inviteForm.role
          }
        }
      );

      if (error) throw error;
      
      toast.success('Invitación enviada exitosamente');
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'franchisee', full_name: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Error al enviar invitación');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Rol actualizado exitosamente');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar rol');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return 'destructive';
      case 'advisor':
        return 'default';
      case 'franchisee':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      key: 'full_name',
      header: 'Nombre',
      render: (user: User) => user.full_name || 'Sin nombre'
    },
    {
      key: 'email',
      header: 'Email',
      render: (user: User) => user.email
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user: User) => (
        <Badge variant={getRoleBadgeVariant(user.role)}>
          {user.role}
        </Badge>
      )
    },
    {
      key: 'created_at',
      header: 'Registrado',
      render: (user: User) => new Date(user.created_at).toLocaleDateString()
    },
    {
      key: 'last_sign_in',
      header: 'Último Acceso',
      render: (user: User) => user.last_sign_in ? 
        new Date(user.last_sign_in).toLocaleDateString() : 
        'Nunca'
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Select
            value={user.role}
            onValueChange={(newRole) => handleUpdateUserRole(user.id, newRole)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="franchisee">Franchisee</SelectItem>
              <SelectItem value="advisor">Advisor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra usuarios, roles y permisos</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invitar Usuario
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="franchisee">Franchisee</SelectItem>
                <SelectItem value="advisor">Advisor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredUsers}
            columns={columns}
          />
        </CardContent>
      </Card>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Invitar Nuevo Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input
                    id="full_name"
                    value={inviteForm.full_name}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Nombre del usuario"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="franchisee">Franchisee</SelectItem>
                      <SelectItem value="advisor">Advisor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleInviteUser}>
                    Enviar Invitación
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
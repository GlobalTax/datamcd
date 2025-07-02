import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUserCreation } from '@/hooks/useUserCreation';
import { showSuccess, showError } from '@/utils/notifications';

interface FormState {
  email: string;
  password: string;
}

interface CreateUserState {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

const AdvisorAuthPage = () => {
  const { signIn } = useAuth();
  const { createUser, loading: creationLoading } = useUserCreation();
  const [formData, setFormData] = useState<FormState>({
    email: '',
    password: ''
  });
  const [createUserData, setCreateUserData] = useState<CreateUserState>({
    email: '',
    password: '',
    fullName: '',
    role: 'asesor'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCreateUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const result = await signIn(formData.email, formData.password);
      
      if (result.error) {
        showError(result.error);
      } else {
        showSuccess('Inicio de sesión exitoso');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await createUser(createUserData);
      if (success) {
        showSuccess('Usuario asesor creado correctamente');
        setCreateUserData({
          email: '',
          password: '',
          fullName: '',
          role: 'asesor'
        });
      }
    } catch (error) {
      console.error('Create user error:', error);
      showError('Error al crear el usuario');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Panel de Asesores</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="create">Crear Usuario</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                    required
                  />
                </div>
                <Button disabled={loading} className="w-full">
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="create-fullName">Nombre Completo</Label>
                  <Input
                    type="text"
                    id="create-fullName"
                    name="fullName"
                    value={createUserData.fullName}
                    onChange={handleCreateUserChange}
                    placeholder="Nombre Completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    type="email"
                    id="create-email"
                    name="email"
                    value={createUserData.email}
                    onChange={handleCreateUserChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-password">Contraseña</Label>
                  <Input
                    type="password"
                    id="create-password"
                    name="password"
                    value={createUserData.password}
                    onChange={handleCreateUserChange}
                    placeholder="********"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="create-role">Rol</Label>
                  <select
                    id="create-role"
                    name="role"
                    value={createUserData.role}
                    onChange={handleCreateUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="asesor">Asesor</option>
                    <option value="admin">Administrador</option>
                    <option value="superadmin">Super Administrador</option>
                  </select>
                </div>
                <Button disabled={creationLoading} className="w-full">
                  {creationLoading ? 'Creando usuario...' : 'Crear Usuario Asesor'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Acceso Rápido:</h4>
            <p className="text-sm text-blue-700 mb-3">
              Puedes crear un nuevo usuario asesor directamente:
            </p>
            <div className="space-y-2">
              <p className="text-xs text-blue-600">
                Email sugerido: <strong>asesor@ejemplo.com</strong><br/>
                Contraseña: <strong>123456</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvisorAuthPage;

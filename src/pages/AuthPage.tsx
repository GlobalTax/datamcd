
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFastAuthActions } from '@/hooks/auth/useFastAuthActions';
import { showSuccess, showError } from '@/utils/notifications';

const AuthPage = () => {
  const { user, clearUserData, session } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'good' | 'slow' | 'poor'>('good');

  const { fastSignIn, fastSignUp, signOut } = useFastAuthActions({
    clearUserData,
    setSession: () => {}, // Se maneja en el AuthProvider
    onAuthSuccess: (userData) => {
      console.log('Auth success in recovery mode:', userData);
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      showError('Por favor completa todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      setConnectionStatus('good');
      
      const result = await fastSignIn(loginData.email, loginData.password);
      
      if (result.error) {
        if (result.error.includes('timeout')) {
          setConnectionStatus('poor');
        }
        // El error ya se muestra en fastSignIn
      } else if (result.success) {
        // El éxito ya se muestra en fastSignIn
      }
    } catch (error) {
      console.error('Login error:', error);
      setConnectionStatus('poor');
      showError('Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.email || !signupData.password || !signupData.fullName) {
      showError('Por favor completa todos los campos');
      return;
    }
    
    if (signupData.password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      setConnectionStatus('good');
      
      const result = await fastSignUp(signupData.email, signupData.password, signupData.fullName);
      
      if (result.error) {
        // El error ya se muestra en fastSignUp
      } else if (result.success) {
        if (result.recoveryMode) {
          setConnectionStatus('slow');
        }
        // El éxito ya se muestra en fastSignUp
      }
    } catch (error) {
      console.error('Signup error:', error);
      setConnectionStatus('poor');
      showError('Error inesperado al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const ConnectionStatusAlert = () => {
    if (connectionStatus === 'good') return null;
    
    return (
      <Alert className={`mb-4 ${connectionStatus === 'slow' ? 'border-yellow-400' : 'border-red-400'}`}>
        <div className="flex items-center">
          {connectionStatus === 'slow' ? 
            <Wifi className="h-4 w-4 text-yellow-600" /> : 
            <WifiOff className="h-4 w-4 text-red-600" />
          }
          <AlertCircle className="h-4 w-4 ml-2" />
        </div>
        <AlertDescription className="ml-6">
          {connectionStatus === 'slow' ? 
            'Conexión lenta detectada. Tu cuenta se ha creado en modo de recuperación.' :
            'Problemas de conexión. Algunos datos pueden tardar en cargarse.'
          }
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Acceso McDonald's</CardTitle>
        </CardHeader>
        <CardContent>
          <ConnectionStatusAlert />
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Crear Cuenta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="********"
                    required
                  />
                </div>
                <Button disabled={loading} className="w-full">
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    placeholder="Tu Nombre Completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Contraseña</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="********"
                    minLength={6}
                    required
                  />
                </div>
                <Button disabled={loading} className="w-full">
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>¿Problemas de conexión?</p>
            <p>El sistema tiene modo de recuperación automático</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;

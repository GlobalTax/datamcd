
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Wifi, WifiOff, Zap, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFastAuthActions } from '@/hooks/auth/useFastAuthActions';
import { showSuccess, showError } from '@/utils/notifications';

const AuthPage = () => {
  const { user, clearUserData, session } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'good' | 'slow' | 'poor'>('good');
  const [showRetryOptions, setShowRetryOptions] = useState(false);
  const [authProgress, setAuthProgress] = useState('');

  const { fastSignIn, fastSignUp, createEmergencyAccount, signOut } = useFastAuthActions({
    clearUserData,
    setSession: () => {}, // Se maneja en el AuthProvider
    onAuthSuccess: (userData) => {
      console.log('Auth success in recovery mode:', userData);
    }
  });

  const handleLogin = async (e: React.FormEvent, isRetry = false) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      showError('Por favor completa todos los campos');
      return;
    }
    
    try {
      setLoading(true);
      setConnectionStatus('good');
      setAuthProgress(isRetry ? 'Reintentando con más tiempo...' : 'Iniciando sesión...');
      setShowRetryOptions(false);
      
      const result = await fastSignIn(loginData.email, loginData.password, isRetry);
      
      if (result.error) {
        if (result.canRetry) {
          setConnectionStatus('slow');
          setShowRetryOptions(true);
          setAuthProgress('');
        } else if (result.error.includes('timeout')) {
          setConnectionStatus('poor');
          setAuthProgress('');
        }
      } else if (result.success) {
        setAuthProgress('¡Éxito!');
        setShowRetryOptions(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setConnectionStatus('poor');
      setAuthProgress('');
      showError('Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent, isRetry = false) => {
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
      setAuthProgress(isRetry ? 'Reintentando con más tiempo...' : 'Creando cuenta...');
      setShowRetryOptions(false);
      
      const result = await fastSignUp(signupData.email, signupData.password, signupData.fullName, isRetry);
      
      if (result.error) {
        if (result.canCreateEmergency) {
          setConnectionStatus('slow');
          setShowRetryOptions(true);
          setAuthProgress('');
        } else if (result.error.includes('timeout')) {
          setConnectionStatus('poor');
          setAuthProgress('');
        }
      } else if (result.success) {
        if (result.recoveryMode) {
          setConnectionStatus('slow');
          setAuthProgress('Cuenta creada en modo de emergencia');
        } else {
          setAuthProgress('¡Cuenta creada con éxito!');
        }
        setShowRetryOptions(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setConnectionStatus('poor');
      setAuthProgress('');
      showError('Error inesperado al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySignup = async () => {
    if (!signupData.email || !signupData.password || !signupData.fullName) {
      showError('Por favor completa todos los campos primero');
      return;
    }
    
    try {
      setLoading(true);
      setAuthProgress('Creando cuenta de emergencia...');
      
      const result = await createEmergencyAccount(signupData.email, signupData.password, signupData.fullName);
      
      if (result.success) {
        setConnectionStatus('slow');
        setAuthProgress('¡Cuenta de emergencia creada!');
        setShowRetryOptions(false);
      }
    } catch (error) {
      console.error('Emergency signup error:', error);
      showError('Error al crear cuenta de emergencia');
    } finally {
      setLoading(false);
    }
  };

  const ConnectionStatusAlert = () => {
    if (connectionStatus === 'good' && !authProgress) return null;
    
    const getStatusConfig = () => {
      switch (connectionStatus) {
        case 'slow':
          return {
            icon: <Wifi className="h-4 w-4 text-yellow-600" />,
            borderColor: 'border-yellow-400',
            title: 'Conexión lenta detectada',
            description: 'Se activó el modo de recuperación para garantizar el acceso.'
          };
        case 'poor':
          return {
            icon: <WifiOff className="h-4 w-4 text-red-600" />,
            borderColor: 'border-red-400',
            title: 'Problemas de conexión',
            description: 'Usa el botón de emergencia para acceso inmediato.'
          };
        default:
          return {
            icon: <Clock className="h-4 w-4 text-blue-600" />,
            borderColor: 'border-blue-400',
            title: authProgress,
            description: ''
          };
      }
    };

    const config = getStatusConfig();
    
    return (
      <Alert className={`mb-4 ${config.borderColor}`}>
        <div className="flex items-center">
          {config.icon}
          <AlertCircle className="h-4 w-4 ml-2" />
        </div>
        <AlertDescription className="ml-6">
          <div className="font-medium">{config.title}</div>
          {config.description && <div className="text-sm mt-1">{config.description}</div>}
        </AlertDescription>
      </Alert>
    );
  };

  const RetryOptions = ({ isLogin = false }) => {
    if (!showRetryOptions) return null;
    
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
        <div className="text-sm font-medium text-gray-700 mb-2">Opciones disponibles:</div>
        <div className="space-y-2">
          <Button
            onClick={(e) => isLogin ? handleLogin(e, true) : handleSignup(e, true)}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={loading}
          >
            <Clock className="h-4 w-4 mr-2" />
            Intentar con más tiempo ({isLogin ? '20s' : '25s'})
          </Button>
          {!isLogin && (
            <Button
              onClick={handleEmergencySignup}
              variant="outline"
              size="sm"
              className="w-full text-green-700 border-green-300 hover:bg-green-50"
              disabled={loading}
            >
              <Zap className="h-4 w-4 mr-2" />
              Crear cuenta de emergencia (acceso inmediato)
            </Button>
          )}
        </div>
      </div>
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
              <form onSubmit={(e) => handleLogin(e, false)} className="space-y-4">
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
                <RetryOptions isLogin={true} />
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={(e) => handleSignup(e, false)} className="space-y-4">
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
                <RetryOptions isLogin={false} />
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-xs text-gray-500 text-center space-y-2">
            <div className="p-2 bg-blue-50 rounded text-blue-700">
              <div className="font-medium">Sistema optimizado:</div>
              <div>✓ Timeouts extendidos (15-25s)</div>
              <div>✓ Modo de emergencia automático</div>
              <div>✓ Acceso inmediato disponible</div>
            </div>
            <p className="text-gray-400">
              ¿Problemas? Usa el botón de emergencia para acceso inmediato
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;

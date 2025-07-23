
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuthCompat';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdvisorAuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [debugMode, setDebugMode] = useState(false);
  
  const { signIn, user, loading, getDebugInfo } = useUnifiedAuth();
  const navigate = useNavigate();

  // Mostrar información de debug en desarrollo
  useEffect(() => {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('lovable');
    setDebugMode(isDev);
  }, []);

  useEffect(() => {
    console.log('AdvisorAuthPage - Effect triggered');
    console.log('AdvisorAuthPage - User:', user);
    console.log('AdvisorAuthPage - Loading:', loading);
    
    if (user && !loading) {
      console.log('AdvisorAuthPage - User loaded, checking role:', user.role);
      
      // Permitir acceso directo para superadmin y otros roles de asesor
      const allowedRoles = ['asesor', 'admin', 'superadmin'];
      
      if (allowedRoles.includes(user.role)) {
        console.log('AdvisorAuthPage - User has advisor permissions, redirecting to /advisor');
        navigate('/advisor');
      } else {
        console.log('AdvisorAuthPage - User does not have advisor permissions');
        toast.error('No tienes permisos de asesor');
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('AdvisorAuthPage - Starting sign in process');
    
    const { error } = await signIn(email, password);
    
    if (error) {
      console.error('AdvisorAuthPage - Sign in error:', error);
    } else {
      console.log('AdvisorAuthPage - Sign in successful, waiting for user data...');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/advisor-auth`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: 'asesor'
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Solicitud de cuenta de asesor enviada. Contacta con el administrador para activar tu cuenta.');
    }
    
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResettingPassword(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/advisor-auth`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Se ha enviado un enlace de recuperación a tu correo electrónico');
      setResetEmail('');
    }

    setIsResettingPassword(false);
  };

  // Bypass temporal para desarrollo/debug
  const handleDebugBypass = () => {
    console.log('AdvisorAuthPage - Debug bypass activated');
    navigate('/advisor');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Verificando autenticación...</p>
          {debugMode && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left text-sm">
              <strong>Debug Info:</strong>
              <pre>{JSON.stringify(getDebugInfo?.(), null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  console.log('AdvisorAuthPage - Rendering auth form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Portal de Asesores</h1>
          <p className="text-gray-600 mt-2">Acceso exclusivo para asesores McDonald's</p>
        </div>

        {debugMode && (
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-amber-600 w-5 h-5 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Modo Debug Activo</strong>
                  </p>
                  <Button 
                    onClick={handleDebugBypass}
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Bypass de Desarrollo
                  </Button>
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">Info de Debug</summary>
                    <pre className="text-xs mt-1 bg-white p-2 rounded border">
                      {JSON.stringify(getDebugInfo?.(), null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Acceso de Asesores</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Solicitar Acceso</TabsTrigger>
                <TabsTrigger value="reset">Recuperar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Corporativo</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="asesor@mcdonalds.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Tu contraseña"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Acceder al Panel de Asesor'
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reset')}
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      ¿Has olvidado tu contraseña?
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-amber-800">
                      <strong>Nota:</strong> Las cuentas de asesor requieren aprobación del administrador.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Email Corporativo</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="asesor@mcdonalds.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Contraseña</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando solicitud...
                      </>
                    ) : (
                      'Solicitar Acceso de Asesor'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reset">
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      placeholder="asesor@mcdonalds.com"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando enlace...
                      </>
                    ) : (
                      'Enviar enlace de recuperación'
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-sm text-gray-600 hover:text-gray-700 underline"
                    >
                      Volver al inicio de sesión
                    </button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-gray-600">
                ¿Eres franquiciado?{' '}
                <button
                  onClick={() => navigate('/auth')}
                  className="text-red-600 hover:text-red-700 underline font-medium"
                >
                  Accede aquí
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvisorAuthPage;

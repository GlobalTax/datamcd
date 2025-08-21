
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { Loader2, Store, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useInputValidation } from '@/hooks/useInputValidation';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string>('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { validatePassword, validateEmail, sanitizeEmail, sanitizeString } = useInputValidation();

  useEffect(() => {
    console.log('AuthPage - Effect triggered');
    console.log('AuthPage - User:', user);
    console.log('AuthPage - Loading:', loading);
    
    if (user && !loading) {
      console.log('AuthPage - User authenticated, redirecting to dashboard');
      // Simplified: redirect all authenticated users to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('AuthPage - Starting sign in process');
    const result = await signIn(email, password);
    
    // Solo mostrar error si hay uno, el éxito se maneja en useAuth
    if (result?.error) {
      console.log('AuthPage - Sign in error:', result.error);
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs before proceeding
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const sanitizedName = sanitizeString(fullName);
    
    if (!emailValidation.valid) {
      toast.error(emailValidation.error || 'Email inválido');
      return;
    }
    
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.error || 'Contraseña inválida');
      return;
    }
    
    if (!sanitizedName || sanitizedName.length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    await signUp(sanitizeEmail(email), password, sanitizedName);
    
    setIsLoading(false);
  };

  // Handle password input with real-time validation
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    
    if (newPassword.length > 0) {
      const validation = validatePassword(newPassword);
      setPasswordStrength(validation.strength || '');
      
      if (!validation.valid && validation.error) {
        setPasswordErrors([validation.error]);
      } else {
        setPasswordErrors([]);
      }
    } else {
      setPasswordStrength('');
      setPasswordErrors([]);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResettingPassword(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Se ha enviado un enlace de recuperación a tu correo electrónico');
      setResetEmail('');
    }

    setIsResettingPassword(false);
  };

  if (loading) {
    console.log('AuthPage - Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  console.log('AuthPage - Rendering auth form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Store className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Portal de Franquiciados</h1>
          <p className="text-gray-600 mt-2">Gestiona tu restaurante McDonald's</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Acceso para Franquiciados</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
                <TabsTrigger value="reset">Recuperar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="tu.email@ejemplo.com"
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
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reset')}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      ¿Has olvidado tu contraseña?
                    </button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
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
                    <Label htmlFor="signupEmail">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="tu.email@ejemplo.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="signupPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        required
                        placeholder="Mínimo 8 caracteres con mayúscula, número y carácter especial"
                        className={`pr-10 ${passwordErrors.length > 0 ? 'border-red-500' : ''} ${passwordStrength === 'fuerte' ? 'border-green-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password strength indicator */}
                    {password.length > 0 && (
                      <div className="space-y-1">
                        {passwordStrength && (
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-full rounded-full ${
                              passwordStrength === 'débil' ? 'bg-red-200' : 
                              passwordStrength === 'media' ? 'bg-yellow-200' : 'bg-green-200'
                            }`}>
                              <div className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrength === 'débil' ? 'w-1/3 bg-red-500' : 
                                passwordStrength === 'media' ? 'w-2/3 bg-yellow-500' : 'w-full bg-green-500'
                              }`} />
                            </div>
                            <span className={`text-xs ${
                              passwordStrength === 'débil' ? 'text-red-600' : 
                              passwordStrength === 'media' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {passwordStrength}
                            </span>
                          </div>
                        )}
                        
                        {passwordErrors.length > 0 && (
                          <div className="text-xs text-red-600">
                            {passwordErrors[0]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      'Crear Cuenta de Franquiciado'
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
                      placeholder="tu.email@ejemplo.com"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
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
                ¿Eres asesor de McDonald's?{' '}
                <button
                  onClick={() => navigate('/advisor-auth')}
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
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

export default AuthPage;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOptimizedSimpleAuth } from '@/hooks/useOptimizedSimpleAuth';
import { useNavigate } from 'react-router-dom';

export default function ImprovedAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error, loading, user } = useOptimizedSimpleAuth();
  const navigate = useNavigate();

  // Redirigir automáticamente si ya está autenticado
  useEffect(() => {
    if (user && !loading) {
      console.log('ImprovedAuthPage - User already authenticated, redirecting based on role:', user.role);
      
      if (['asesor', 'admin', 'superadmin'].includes(user.role)) {
        navigate('/advisor', { replace: true });
      } else if (user.role === 'franchisee') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await signIn(email, password);
      
      if (success) {
        console.log('Login exitoso, redirigiendo...');
        // La redirección se maneja en el useEffect
      } else {
        console.error('Login falló');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MCDATACENTER
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestión de Franquicias
          </p>
          <p className="mt-1 text-center text-xs text-blue-600">
            Versión mejorada - useOptimizedSimpleAuth
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
            
            <div className="mt-6 space-y-2">
              <div className="flex justify-center space-x-4 text-sm">
                <Button
                  variant="link"
                  onClick={() => navigate('/debug-auth')}
                  className="text-sm"
                >
                  🔧 Debug de Auth
                </Button>
                <Button
                  variant="link"
                  onClick={() => navigate('/auth')}
                  className="text-sm"
                >
                  🔄 Sistema Original
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Optimizado para estabilidad y rendimiento</p>
          <p>Timeouts: 10s | Auto-recovery: ✅ | RLS Safe: ✅</p>
        </div>
      </div>
    </div>
  );
}
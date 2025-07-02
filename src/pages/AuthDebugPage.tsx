import React from 'react';
import { AuthDebugger } from '@/components/debug/AuthDebugger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useOptimizedSimpleAuth } from '@/hooks/useOptimizedSimpleAuth';
import { useNavigate } from 'react-router-dom';

export default function AuthDebugPage() {
  const authHook = useAuth();
  const optimizedAuthHook = useOptimizedSimpleAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug de Autenticación - MCDATACENTER</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Esta página te ayudará a diagnosticar problemas de autenticación y login.
            Revisa la información a continuación para identificar qué está fallando.
          </p>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              size="sm"
            >
              📝 Sistema Original
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/auth-improved')}
              size="sm"
            >
              ⚡ Sistema Mejorado
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              size="sm"
            >
              🏠 Inicio
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparación de Hooks */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Comparación de Hooks de Autenticación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                useAuth (Sistema Principal)
                <Badge variant={authHook.loading ? "secondary" : "default"}>
                  {authHook.loading ? 'Cargando' : 'Listo'}
                </Badge>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Loading:</span>
                  <Badge variant={authHook.loading ? "destructive" : "default"}>
                    {authHook.loading ? '✅ Sí' : '❌ No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Usuario:</span>
                  <Badge variant={authHook.user ? "default" : "secondary"}>
                    {authHook.user ? '✅ Presente' : '❌ Ausente'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Sesión:</span>
                  <Badge variant={authHook.session ? "default" : "secondary"}>
                    {authHook.session ? '✅ Activa' : '❌ Inactiva'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Franquiciado:</span>
                  <Badge variant={authHook.franchisee ? "default" : "secondary"}>
                    {authHook.franchisee ? '✅ Presente' : '❌ Ausente'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Restaurantes:</span>
                  <Badge variant="outline">{authHook.restaurants.length}</Badge>
                </div>
                {authHook.user && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <div><strong>Email:</strong> {authHook.user.email}</div>
                    <div><strong>Rol:</strong> {authHook.user.role}</div>
                    <div><strong>ID:</strong> {authHook.user.id}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                useOptimizedSimpleAuth (Sistema Mejorado)
                <Badge variant={optimizedAuthHook.loading ? "secondary" : "default"}>
                  {optimizedAuthHook.loading ? 'Cargando' : 'Listo'}
                </Badge>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Loading:</span>
                  <Badge variant={optimizedAuthHook.loading ? "destructive" : "default"}>
                    {optimizedAuthHook.loading ? '✅ Sí' : '❌ No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Usuario:</span>
                  <Badge variant={optimizedAuthHook.user ? "default" : "secondary"}>
                    {optimizedAuthHook.user ? '✅ Presente' : '❌ Ausente'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Autenticado:</span>
                  <Badge variant={optimizedAuthHook.isAuthenticated ? "default" : "secondary"}>
                    {optimizedAuthHook.isAuthenticated ? '✅ Sí' : '❌ No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Franquiciado:</span>
                  <Badge variant={optimizedAuthHook.franchisee ? "default" : "secondary"}>
                    {optimizedAuthHook.franchisee ? '✅ Presente' : '❌ Ausente'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Restaurantes:</span>
                  <Badge variant="outline">{optimizedAuthHook.restaurants.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Error:</span>
                  <Badge variant={optimizedAuthHook.error ? "destructive" : "default"}>
                    {optimizedAuthHook.error ? 'Sí' : 'Ninguno'}
                  </Badge>
                </div>
                {optimizedAuthHook.user && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                    <div><strong>Email:</strong> {optimizedAuthHook.user.email}</div>
                    <div><strong>Rol:</strong> {optimizedAuthHook.user.role}</div>
                    <div><strong>ID:</strong> {optimizedAuthHook.user.id}</div>
                  </div>
                )}
                {optimizedAuthHook.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <strong>Error:</strong> {optimizedAuthHook.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Detallado */}
      <AuthDebugger />

      {/* Acciones de Debug */}
      <Card>
        <CardHeader>
          <CardTitle>🛠️ Acciones de Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Problemas Comunes y Soluciones</h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Problema:</strong> Usuario no se carga después del login<br/>
                <strong>Solución:</strong> Verificar que el trigger handle_new_user esté activo en Supabase
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Problema:</strong> Timeouts en consultas<br/>
                <strong>Solución:</strong> Verificar conexión a internet y estado de Supabase
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Problema:</strong> Errores de RLS (Row Level Security)<br/>
                <strong>Solución:</strong> Verificar políticas RLS en las tablas de Supabase
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Problema:</strong> Race conditions en AuthProvider<br/>
                <strong>Solución:</strong> Migrar a useOptimizedSimpleAuth que es más estable
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <strong>Mejora:</strong> Sistema optimizado disponible<br/>
                <strong>Beneficio:</strong> Timeouts controlados, mejor manejo de errores, auto-recovery
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Recomendación</h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm">
                <strong>Para resolver los problemas de acceso:</strong><br/>
                1. Usa el <strong>Sistema Mejorado</strong> en <code>/auth-improved</code><br/>
                2. El sistema optimizado tiene mejor manejo de timeouts y errores<br/>
                3. Incluye auto-recovery y redirección inteligente basada en rol<br/>
                4. Si persisten problemas, usa los botones de acceso directo en la página principal
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Acceso Directo (Emergencia)</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => navigate('/advisor')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                🔧 Ir a Panel Asesor
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                🏪 Ir a Panel Franquiciado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
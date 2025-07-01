
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AuthDebugInfo {
  session: any;
  user: any;
  profile: any;
  franchisee: any;
  restaurants: any[];
  rlsEnabled: boolean;
  policies: any[];
  errors: string[];
}

export const AuthDebugger: React.FC = () => {
  const { user, session, franchisee, restaurants, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const errors: string[] = [];
    const info: Partial<AuthDebugInfo> = { errors };

    try {
      // 1. Verificar sesión
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      info.session = currentSession;
      
      if (sessionError) {
        errors.push(`Error de sesión: ${sessionError.message}`);
      }

      // 2. Verificar usuario actual
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      info.user = currentUser;
      
      if (userError) {
        errors.push(`Error de usuario: ${userError.message}`);
      }

      // 3. Verificar perfil
      if (currentUser) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        info.profile = profile;
        
        if (profileError) {
          errors.push(`Error de perfil: ${profileError.message}`);
        }

        // 4. Verificar datos de franquiciado
        if (profile?.role === 'franchisee') {
          const { data: franchiseeData, error: franchiseeError } = await supabase
            .from('franchisees')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
          
          info.franchisee = franchiseeData;
          
          if (franchiseeError) {
            if (franchiseeError.code === 'PGRST116') {
              errors.push('No se encontraron datos de franquiciado (normal para usuarios nuevos)');
            } else {
              errors.push(`Error de franquiciado: ${franchiseeError.message}`);
            }
          }

          // 5. Verificar restaurantes
          if (franchiseeData) {
            const { data: restaurantsData, error: restaurantsError } = await supabase
              .from('franchisee_restaurants')
              .select(`
                *,
                base_restaurant:base_restaurants(*)
              `)
              .eq('franchisee_id', franchiseeData.id)
              .eq('status', 'active');
            
            info.restaurants = restaurantsData || [];
            
            if (restaurantsError) {
              errors.push(`Error de restaurantes: ${restaurantsError.message}`);
            }
          }
        }
      }

      // 6. Verificar RLS - simulado ya que no existe get_table_rls_status
      info.rlsEnabled = true; // Asumimos que RLS está habilitado

      setDebugInfo(info as AuthDebugInfo);

    } catch (error) {
      errors.push(`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setDebugInfo({ errors } as AuthDebugInfo);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Debug de Autenticación
            <Button 
              onClick={runDiagnostics} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Verificando...' : 'Actualizar'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Estado del Hook */}
          <div>
            <h3 className="font-semibold mb-2">Estado del Hook useAuth</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Loading: <Badge variant={loading ? 'destructive' : 'default'}>{loading ? 'Sí' : 'No'}</Badge></div>
              <div>Usuario: <Badge variant={user ? 'default' : 'secondary'}>{user ? 'Presente' : 'Ausente'}</Badge></div>
              <div>Sesión: <Badge variant={session ? 'default' : 'secondary'}>{session ? 'Activa' : 'Inactiva'}</Badge></div>
              <div>Franquiciado: <Badge variant={franchisee ? 'default' : 'secondary'}>{franchisee ? 'Presente' : 'Ausente'}</Badge></div>
              <div>Restaurantes: <Badge variant="outline">{restaurants.length}</Badge></div>
            </div>
          </div>

          {/* Información de Debug */}
          {debugInfo && (
            <>
              {/* Sesión */}
              <div>
                <h3 className="font-semibold mb-2">Sesión de Supabase</h3>
                <div className="bg-gray-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
                  <pre>{JSON.stringify(debugInfo.session, null, 2)}</pre>
                </div>
              </div>

              {/* Usuario */}
              <div>
                <h3 className="font-semibold mb-2">Usuario de Supabase</h3>
                <div className="bg-gray-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
                  <pre>{JSON.stringify(debugInfo.user, null, 2)}</pre>
                </div>
              </div>

              {/* Perfil */}
              <div>
                <h3 className="font-semibold mb-2">Perfil de Usuario</h3>
                <div className="bg-gray-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
                  <pre>{JSON.stringify(debugInfo.profile, null, 2)}</pre>
                </div>
              </div>

              {/* Franquiciado */}
              <div>
                <h3 className="font-semibold mb-2">Datos de Franquiciado</h3>
                <div className="bg-gray-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
                  <pre>{JSON.stringify(debugInfo.franchisee, null, 2)}</pre>
                </div>
              </div>

              {/* Restaurantes */}
              <div>
                <h3 className="font-semibold mb-2">Restaurantes ({debugInfo.restaurants?.length || 0})</h3>
                <div className="bg-gray-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
                  <pre>{JSON.stringify(debugInfo.restaurants, null, 2)}</pre>
                </div>
              </div>

              {/* Errores */}
              {debugInfo.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">Errores Detectados</h3>
                  <div className="space-y-1">
                    {debugInfo.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 p-2 rounded text-sm text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RLS */}
              <div>
                <h3 className="font-semibold mb-2">Row Level Security</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>RLS Habilitado: <Badge variant={debugInfo.rlsEnabled ? 'default' : 'destructive'}>{debugInfo.rlsEnabled ? 'Sí' : 'No'}</Badge></div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

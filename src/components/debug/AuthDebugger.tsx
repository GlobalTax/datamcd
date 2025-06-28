
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';

export const AuthDebugger: React.FC = () => {
  const { 
    user, 
    franchisee, 
    restaurants, 
    loading
  } = useAuth();

  // Función simplificada para refrescar datos
  const refreshData = () => {
    window.location.reload();
  };

  // Estado de conexión simulado basado en los datos disponibles
  const connectionStatus = user ? 'connected' : 'disconnected';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'connecting': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      case 'connecting': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="mb-6 border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Estado de Autenticación</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(connectionStatus)}>
              {getStatusIcon(connectionStatus)}
              <span className="ml-1 capitalize">{connectionStatus}</span>
            </Badge>
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Usuario:</strong>
            <div className="mt-1">
              {user ? (
                <div className="space-y-1">
                  <div>Email: {user.email}</div>
                  <div>Rol: {user.role}</div>
                  <div>ID: {user.id.substring(0, 8)}...</div>
                </div>
              ) : (
                <span className="text-gray-500">No autenticado</span>
              )}
            </div>
          </div>

          <div>
            <strong>Franquiciado:</strong>
            <div className="mt-1">
              {franchisee ? (
                <div className="space-y-1">
                  <div>Nombre: {franchisee.franchisee_name}</div>
                  <div>Restaurantes: {franchisee.total_restaurants || 0}</div>
                  <div>ID: {franchisee.id.substring(0, 8)}...</div>
                </div>
              ) : (
                <span className="text-gray-500">Sin datos</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <strong>Restaurantes:</strong>
          <div className="mt-1">
            {restaurants && restaurants.length > 0 ? (
              <div>
                <div>Total: {restaurants.length}</div>
                <div className="text-gray-600">
                  {restaurants.slice(0, 2).map(r => 
                    r.base_restaurant?.restaurant_name || 'Sin nombre'
                  ).join(', ')}
                  {restaurants.length > 2 && ` y ${restaurants.length - 2} más`}
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Ninguno</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <span>Cargando: {loading ? 'Sí' : 'No'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Autenticado: {user ? 'Sí' : 'No'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

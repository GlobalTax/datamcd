
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useSimpleAuth';
import { User, Building, RefreshCw, LogOut } from 'lucide-react';

const SimpleAuthDebugger = () => {
  const { user, session, franchisee, restaurants, loading, refreshData, signOut } = useAuth();

  const handleRefresh = async () => {
    await refreshData();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Depurador de Autenticación (Simplificado)
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de carga */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Estado:</span>
          <Badge variant={loading ? "secondary" : "default"}>
            {loading ? "Cargando..." : "Listo"}
          </Badge>
        </div>

        {/* Usuario */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Usuario</h3>
          {user ? (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Nombre:</strong> {user.full_name || 'No especificado'}</div>
                <div><strong>Rol:</strong> <Badge>{user.role}</Badge></div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 p-3 rounded-lg text-red-700">
              No hay usuario autenticado
            </div>
          )}
        </div>

        {/* Sesión */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Sesión</h3>
          <div className={`p-3 rounded-lg ${session ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="text-sm">
              <strong>Estado:</strong> {session ? 'Activa' : 'No activa'}
              {session && (
                <div className="mt-1">
                  <strong>Expira:</strong> {new Date(session.expires_at * 1000).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Franquiciado */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Franquiciado</h3>
          {franchisee ? (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>ID:</strong> {franchisee.id}</div>
                <div><strong>Nombre:</strong> {franchisee.franchisee_name}</div>
                <div><strong>Empresa:</strong> {franchisee.company_name || 'No especificada'}</div>
                <div><strong>Ciudad:</strong> {franchisee.city || 'No especificada'}</div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
              {user?.role === 'franchisee' ? 'Cargando datos del franquiciado...' : 'No es franquiciado'}
            </div>
          )}
        </div>

        {/* Restaurantes */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Building className="w-4 h-4" />
            Restaurantes ({restaurants.length})
          </h3>
          {restaurants.length > 0 ? (
            <div className="grid gap-2">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-yellow-50 p-3 rounded-lg">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><strong>Sitio:</strong> {restaurant.site_number}</div>
                    <div><strong>Nombre:</strong> {restaurant.restaurant_name}</div>
                    <div><strong>Ciudad:</strong> {restaurant.city}</div>
                    <div><strong>Tipo:</strong> {restaurant.restaurant_type}</div>
                    <div><strong>Estado:</strong> <Badge variant="outline">{restaurant.status}</Badge></div>
                    <div><strong>Dirección:</strong> {restaurant.address}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
              No hay restaurantes asignados
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleAuthDebugger;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, TrendingUp, AlertTriangle, Database } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const SuperadminDashboard = () => {
  // Obtener estadísticas globales del sistema
  const { data: systemStats, isLoading } = useQuery({
    queryKey: ['systemStats'],
    queryFn: async () => {
      const [
        { count: totalFranchisees },
        { count: totalRestaurants },
        { count: totalUsers },
        { count: activeIncidents }
      ] = await Promise.all([
        supabase.from('franchisees').select('*', { count: 'exact', head: true }),
        supabase.from('base_restaurants').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'open')
      ]);

      return {
        totalFranchisees: totalFranchisees || 0,
        totalRestaurants: totalRestaurants || 0,
        totalUsers: totalUsers || 0,
        activeIncidents: activeIncidents || 0
      };
    }
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('franchisee_activity_log')
        .select(`
          *,
          franchisees!inner(franchisee_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Franquiciados</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalFranchisees}</div>
            <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurantes</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalRestaurants}</div>
            <p className="text-xs text-muted-foreground">En base de datos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios del Sistema</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Perfiles activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidencias Abiertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.activeIncidents}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.activity_type}</h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.franchisees?.franchisee_name} - {activity.activity_description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay actividad reciente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel de control rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-3 border rounded cursor-pointer hover:bg-gray-50">
                <p className="font-medium">Gestión de Franquiciados</p>
                <p className="text-sm text-muted-foreground">Administrar usuarios y asignaciones</p>
              </div>
              <div className="p-3 border rounded cursor-pointer hover:bg-gray-50">
                <p className="font-medium">Base de Restaurantes</p>
                <p className="text-sm text-muted-foreground">Configurar locales y datos</p>
              </div>
              <div className="p-3 border rounded cursor-pointer hover:bg-gray-50">
                <p className="font-medium">Sistema de Incidencias</p>
                <p className="text-sm text-muted-foreground">Monitorear y resolver problemas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Base de datos</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Operativo</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Integraciones</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Operativo</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Autenticación</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Operativo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingFallback } from '@/components/common/LoadingFallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  Store, 
  DollarSign,
  RefreshCw,
  Calendar,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface KPIData {
  totalFranchisees: number;
  totalRestaurants: number;
  avgRevenue: number;
  alertsCount: number;
  tasksCount: number;
  revenueGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'task' | 'alert' | 'communication';
  title: string;
  description: string;
  timestamp: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export const AdvancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [kpiData, setKpiData] = useState<KPIData>({
    totalFranchisees: 0,
    totalRestaurants: 0,
    avgRevenue: 0,
    alertsCount: 0,
    tasksCount: 0,
    revenueGrowth: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKPIData = async () => {
    try {
      // Obtener total de franquiciados
      const { data: franchisees } = await supabase
        .from('franchisees')
        .select('id');

      // Obtener total de restaurantes
      const { data: restaurants } = await supabase
        .from('franchisee_restaurants')
        .select('id, last_year_revenue')
        .eq('status', 'active');

      // Obtener alertas activas
      const { data: alerts } = await supabase
        .from('advisor_alert_instances')
        .select('id')
        .eq('is_acknowledged', false);

      // Obtener tareas pendientes
      const { data: tasks } = await supabase
        .from('advisor_tasks')
        .select('id')
        .in('status', ['pending', 'in_progress']);

      // Calcular promedio de ingresos
      const totalRevenue = restaurants?.reduce((sum, r) => sum + (r.last_year_revenue || 0), 0) || 0;
      const avgRevenue = restaurants?.length ? totalRevenue / restaurants.length : 0;

      setKpiData({
        totalFranchisees: franchisees?.length || 0,
        totalRestaurants: restaurants?.length || 0,
        avgRevenue,
        alertsCount: alerts?.length || 0,
        tasksCount: tasks?.length || 0,
        revenueGrowth: 8.2 // Mock data - sería calculado con datos históricos
      });
    } catch (error) {
      logger.error('Failed to fetch KPI data', { error: error.message, action: 'fetch_kpi_data' });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Simular actividad reciente - en producción sería de las tablas reales
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'alert',
          title: 'Bajo rendimiento detectado',
          description: 'Restaurante Madrid Centro - Ventas 15% por debajo del objetivo',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          priority: 'high'
        },
        {
          id: '2',
          type: 'task',
          title: 'Auditoría programada',
          description: 'Revisar procedimientos operativos - Restaurante Barcelona Este',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          priority: 'normal'
        },
        {
          id: '3',
          type: 'communication',
          title: 'Consulta franquiciado',
          description: 'Juan Pérez solicita información sobre nuevas promociones',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          priority: 'low'
        }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      logger.error('Failed to fetch recent activity', { error: error.message, action: 'fetch_recent_activity' });
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchKPIData(), fetchRecentActivity()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Hace menos de 1 hora';
    if (hours === 1) return 'Hace 1 hora';
    return `Hace ${hours} horas`;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'task': return <Target className="w-4 h-4 text-blue-600" />;
      case 'communication': return <Users className="w-4 h-4 text-green-600" />;
      default: return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return <LoadingFallback variant="card" message="Cargando dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Franquiciados</p>
                <p className="text-2xl font-bold text-blue-900">{kpiData.totalFranchisees}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Restaurantes</p>
                <p className="text-2xl font-bold text-green-900">{kpiData.totalRestaurants}</p>
              </div>
              <Store className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Ingresos Promedio</p>
                <p className="text-xl font-bold text-purple-900">{formatCurrency(kpiData.avgRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Alertas Activas</p>
                <p className="text-2xl font-bold text-orange-900">{kpiData.alertsCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-700">Tareas Pendientes</p>
                <p className="text-2xl font-bold text-cyan-900">{kpiData.tasksCount}</p>
              </div>
              <Target className="w-8 h-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Crecimiento</p>
                <div className="flex items-center gap-1">
                  <p className="text-xl font-bold text-emerald-900">+{kpiData.revenueGrowth}%</p>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>
          
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Actividad Reciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium">{activity.title}</h4>
                          {activity.priority && (
                            <Badge className={getPriorityColor(activity.priority)} variant="outline">
                              {activity.priority}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resumen de Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Estado General del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Franquiciados Activos</span>
                    <Badge className="bg-green-100 text-green-800">
                      {kpiData.totalFranchisees} activos
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Restaurantes Operativos</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {kpiData.totalRestaurants} operando
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alertas Críticas</span>
                    <Badge className={kpiData.alertsCount > 5 ? "bg-destructive text-destructive-foreground" : "bg-green-100 text-green-800"}>
                      {kpiData.alertsCount} alertas
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tareas Atrasadas</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      2 atrasadas
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gráficos de rendimiento y análisis detallados se implementarán aquí.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Centro de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sistema de alertas personalizables se implementará aquí.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
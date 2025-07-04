import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Euro,
  Users,
  Building,
  Calendar,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  activeRestaurants: number;
  activeFranchisees: number;
  pendingPayments: number;
  overdueContracts: number;
  averagePerformance: number;
  topPerformers: Array<{
    name: string;
    revenue: number;
    growth: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    restaurants: number;
    franchisees: number;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    timestamp: string;
  }>;
}

export const AdvancedDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    revenueGrowth: 0,
    activeRestaurants: 0,
    activeFranchisees: 0,
    pendingPayments: 0,
    overdueContracts: 0,
    averagePerformance: 0,
    topPerformers: [],
    monthlyTrends: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardMetrics = async () => {
    try {
      setRefreshing(true);

      // Obtener restaurantes activos
      const { data: restaurants } = await supabase
        .from('base_restaurants')
        .select('*');

      // Obtener franquiciados activos
      const { data: franchisees } = await supabase
        .from('franchisees')
        .select('*');

      // Obtener asignaciones
      const { data: assignments } = await supabase
        .from('franchisee_restaurants')
        .select(`
          *,
          base_restaurant:base_restaurants(*),
          franchisee:franchisees(*)
        `);

      // Calcular métricas
      const totalRevenue = assignments?.reduce((sum, assignment) => 
        sum + (assignment.last_year_revenue || 0), 0) || 0;

      const revenueGrowth = Math.random() * 20 - 10; // Simulado por ahora

      // Top performers basado en ingresos
      const topPerformers = assignments
        ?.filter(a => a.last_year_revenue)
        .sort((a, b) => (b.last_year_revenue || 0) - (a.last_year_revenue || 0))
        .slice(0, 5)
        .map(assignment => ({
          name: assignment.base_restaurant?.restaurant_name || 'Sin nombre',
          revenue: assignment.last_year_revenue || 0,
          growth: Math.random() * 30 - 10 // Simulado
        })) || [];

      // Tendencias mensuales (simulado por ahora)
      const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: date.toLocaleDateString('es-ES', { month: 'short' }),
          revenue: Math.floor(Math.random() * 1000000 + 500000),
          restaurants: Math.floor(Math.random() * 10 + (restaurants?.length || 0) - 5),
          franchisees: Math.floor(Math.random() * 5 + (franchisees?.length || 0) - 2)
        };
      });

      // Alertas simuladas
      const alerts = [
        {
          id: '1',
          type: 'warning' as const,
          title: 'Contratos próximos a vencer',
          description: '3 contratos de franquicia vencen en los próximos 30 días',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'error' as const,
          title: 'Pagos pendientes',
          description: '2 franquiciados tienen pagos atrasados',
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          type: 'info' as const,
          title: 'Nuevo restaurante registrado',
          description: 'Se ha registrado un nuevo restaurante en Madrid',
          timestamp: new Date().toISOString()
        }
      ];

      setMetrics({
        totalRevenue,
        revenueGrowth,
        activeRestaurants: restaurants?.length || 0,
        activeFranchisees: franchisees?.length || 0,
        pendingPayments: 2, // Simulado
        overdueContracts: 3, // Simulado
        averagePerformance: 85.5, // Simulado
        topPerformers,
        monthlyTrends,
        alerts
      });

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast.error('Error al cargar las métricas del dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, [timeFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-primary" />;
      default: return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Avanzado</h1>
          <p className="text-muted-foreground">Métricas y análisis en tiempo real</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={fetchDashboardMetrics} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  {metrics.revenueGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-success mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    metrics.revenueGrowth >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Euro className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Restaurantes Activos</p>
                <p className="text-3xl font-bold text-foreground">{metrics.activeRestaurants}</p>
                <p className="text-sm text-muted-foreground mt-2">+2 este mes</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Franquiciados</p>
                <p className="text-3xl font-bold text-foreground">{metrics.activeFranchisees}</p>
                <p className="text-sm text-muted-foreground mt-2">+1 este mes</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rendimiento Promedio</p>
                <p className="text-3xl font-bold text-foreground">{metrics.averagePerformance}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-success mr-1" />
                  <span className="text-sm font-medium text-success">+2.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tendencias mensuales */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Tendencias Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alertas y Notificaciones */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(alert.timestamp).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top 5 Restaurantes por Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(performer.revenue)}
                    </p>
                  </div>
                </div>
                <Badge variant={performer.growth >= 0 ? "default" : "destructive"}>
                  {performer.growth > 0 ? '+' : ''}{performer.growth.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
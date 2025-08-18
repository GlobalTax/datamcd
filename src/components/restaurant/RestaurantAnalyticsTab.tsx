import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRestaurantAnalytics } from '@/hooks/useRestaurantAnalytics';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { TrendingUp, BarChart3, Target, Activity } from 'lucide-react';

interface RestaurantAnalyticsTabProps {
  restaurantId: string;
}

export const RestaurantAnalyticsTab: React.FC<RestaurantAnalyticsTabProps> = ({ restaurantId }) => {
  const { analytics, loading } = useRestaurantAnalytics({ restaurantId });

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageTicket ? formatCurrency(analytics.averageTicket) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.ticketGrowth !== null && (
                <span className={analytics.ticketGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {analytics.ticketGrowth >= 0 ? '+' : ''}{analytics.ticketGrowth.toFixed(1)}% vs mes anterior
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes/Mes</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.monthlyCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.customerGrowth !== null && (
                <span className={analytics.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {analytics.customerGrowth >= 0 ? '+' : ''}{analytics.customerGrowth.toFixed(1)}% vs mes anterior
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Operativa</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.operationalEfficiency ? `${analytics.operationalEfficiency.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.operationalEfficiency && (
                <span className={analytics.operationalEfficiency >= 80 ? 'text-green-600' : analytics.operationalEfficiency >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                  {analytics.operationalEfficiency >= 80 ? 'Excelente' : analytics.operationalEfficiency >= 60 ? 'Bueno' : 'Necesita mejora'}
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productividad</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.productivity ? formatCurrency(analytics.productivity) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">€/empleado/día</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue vs Target */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Objetivo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.revenueVsTarget}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stackId="1"
                  stroke="hsl(var(--muted-foreground))" 
                  fill="hsl(var(--muted))"
                  name="Objetivo"
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stackId="2"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  name="Real"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Satisfaction Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Satisfacción</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.satisfactionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Puntuación"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Costes vs Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics.costAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Ingresos"
              />
              <Line 
                type="monotone" 
                dataKey="costs" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="Costes"
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                name="Beneficio"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Métricas Clave</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Margen de Beneficio</p>
              <p className="text-2xl font-bold">{analytics.profitMargin ? `${analytics.profitMargin.toFixed(1)}%` : 'N/A'}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">ROI Mensual</p>
              <p className="text-2xl font-bold">{analytics.monthlyROI ? `${analytics.monthlyROI.toFixed(1)}%` : 'N/A'}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Coste por Cliente</p>
              <p className="text-2xl font-bold">{analytics.costPerCustomer ? formatCurrency(analytics.costPerCustomer) : 'N/A'}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Tiempo Promedio Servicio</p>
              <p className="text-2xl font-bold">{analytics.avgServiceTime ? `${analytics.avgServiceTime}min` : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
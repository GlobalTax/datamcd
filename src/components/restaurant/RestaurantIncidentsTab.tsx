import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRestaurantIncidents } from '@/hooks/useRestaurantIncidents';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Clock, CheckCircle, Plus, TrendingUp } from 'lucide-react';

interface RestaurantIncidentsTabProps {
  restaurantId: string;
}

export const RestaurantIncidentsTab: React.FC<RestaurantIncidentsTabProps> = ({ restaurantId }) => {
  const { incidents, metrics, loading } = useRestaurantIncidents(restaurantId);

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
      case 'pending':
        return 'destructive';
      case 'in_progress':
        return 'default';
      case 'resolved':
      case 'closed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="space-y-6">
      {/* Incident Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidencias Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.criticalIncidents} críticas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio de Resolución</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgResolutionTime ? `${metrics.avgResolutionTime}h` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">MTTR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltas Este Mes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.resolvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalIncidents} totales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Incidents by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Incidencias por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.incidentsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.incidentsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="incidents" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Incidencias Recientes</CardTitle>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Incidencia
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Título</th>
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Prioridad</th>
                  <th className="text-left py-2">Estado</th>
                  <th className="text-left py-2">Fecha</th>
                  <th className="text-left py-2">Asignado a</th>
                </tr>
              </thead>
              <tbody>
                {incidents.slice(0, 10).map((incident) => (
                  <tr key={incident.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 font-medium">{incident.title}</td>
                    <td className="py-3">
                      <Badge variant="outline">{incident.type}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={getPriorityBadgeVariant(incident.priority)}>
                        {incident.priority}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={getStatusBadgeVariant(incident.status)}>
                        {incident.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(incident.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {incident.assigned_to || 'Sin asignar'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useMetrics } from '@/hooks/useMetrics';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  Euro, 
  BarChart3,
  RefreshCw
} from 'lucide-react';

export function MetricsDashboard() {
  const { 
    dashboardMetrics, 
    isLoadingDashboard, 
    calculateMetrics 
  } = useMetrics();

  const handleRefreshMetrics = () => {
    calculateMetrics.mutate(undefined);
  };

  if (isLoadingDashboard) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = dashboardMetrics;

  return (
    <div className="space-y-6">
      {/* Header con botón de refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Métricas en Tiempo Real</h2>
          <p className="text-muted-foreground">
            Indicadores clave de rendimiento de incidencias
          </p>
        </div>
        <Button 
          onClick={handleRefreshMetrics}
          disabled={calculateMetrics.isPending}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${calculateMetrics.isPending ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Grid de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* MTTR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTTR</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.mttr?.value ? `${metrics.mttr.value.toFixed(1)}h` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo promedio de resolución
            </p>
            {metrics?.mttr?.value && (
              <Badge variant={metrics.mttr.value < 24 ? "default" : "destructive"} className="mt-2">
                {metrics.mttr.value < 24 ? 'Óptimo' : 'Mejorable'}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* MTTA */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTTA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.mtta?.value ? `${metrics.mtta.value.toFixed(1)}h` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo promedio hasta asignación
            </p>
            {metrics?.mtta?.value && (
              <Badge variant={metrics.mtta.value < 4 ? "default" : "secondary"} className="mt-2">
                {metrics.mtta.value < 4 ? 'Rápido' : 'Normal'}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Total Incidencias */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidencias Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalIncidents?.value || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Incidencias registradas hoy
            </p>
          </CardContent>
        </Card>

        {/* Incidencias Críticas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidencias Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics?.criticalIncidents?.value || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
            {metrics?.criticalIncidents?.value > 0 && (
              <Badge variant="destructive" className="mt-2">
                Alta Prioridad
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* CAPEX Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAPEX Total</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.capexTotal?.value ? 
                `€${metrics.capexTotal.value.toLocaleString()}` : 
                '€0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Inversión en incidencias
            </p>
          </CardContent>
        </Card>

        {/* Eficiencia Global */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Global</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.mttr?.value && metrics?.totalIncidents?.value ? 
                `${(100 - (metrics.mttr.value / 24 * 100)).toFixed(0)}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Basado en MTTR y volumen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de métricas disponibles */}
      {metrics?.allMetrics && metrics.allMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Todas las Métricas</CardTitle>
            <CardDescription>
              Estado completo de métricas calculadas hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.allMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{metric.metric?.label}</p>
                    <p className="text-sm text-muted-foreground">{metric.metric?.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{metric.value} {metric.metric?.unit}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(metric.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje si no hay métricas */}
      {(!metrics?.allMetrics || metrics.allMetrics.length === 0) && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay métricas disponibles</h3>
              <p className="text-muted-foreground mb-4">
                Haz clic en "Actualizar" para calcular las métricas actuales
              </p>
              <Button onClick={handleRefreshMetrics} disabled={calculateMetrics.isPending}>
                <RefreshCw className={`h-4 w-4 mr-2 ${calculateMetrics.isPending ? 'animate-spin' : ''}`} />
                Calcular Métricas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
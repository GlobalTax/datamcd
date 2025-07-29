import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BarChart3, FileText, Mic } from 'lucide-react';
import { useNewIncidents } from '@/hooks/useNewIncidents';
import { IncidentFilters } from '@/types/newIncident';
import { MetricsDashboard } from './MetricsDashboard';
import { VoiceNotesManager } from '@/components/voice/VoiceNotesManager';

export function NewIncidentManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { incidents, isLoading } = useNewIncidents(filters);

  // Calcular estadísticas rápidas
  const stats = {
    total: incidents?.length || 0,
    open: incidents?.filter(i => i.status === 'open').length || 0,
    inProgress: incidents?.filter(i => i.status === 'in_progress').length || 0,
    resolved: incidents?.filter(i => i.status === 'resolved').length || 0,
    critical: incidents?.filter(i => i.priority === 'critical').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Incidencias 360°</h1>
          <p className="text-muted-foreground">
            Sistema unificado de incidencias con métricas, reportes y notas de voz
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Mic className="h-4 w-4 mr-2" />
            Nota de Voz
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Incidencia
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <p className="text-sm text-muted-foreground">Abiertas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-sm text-muted-foreground">En Progreso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-sm text-muted-foreground">Resueltas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
            <p className="text-sm text-muted-foreground">Críticas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reportes
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Mic className="h-4 w-4 mr-2" />
            Notas de Voz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incidencias Recientes</CardTitle>
              <CardDescription>
                Las incidencias más recientes del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Cargando incidencias...</p>
                </div>
              ) : incidents && incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.slice(0, 10).map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{incident.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {incident.restaurant?.name} • {incident.restaurant?.site_number}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={
                            incident.priority === 'critical' ? 'destructive' :
                            incident.priority === 'high' ? 'default' :
                            'secondary'
                          }>
                            {incident.priority}
                          </Badge>
                          <Badge variant="outline">
                            {incident.status}
                          </Badge>
                          {incident.source !== 'manual' && (
                            <Badge variant="secondary">
                              {incident.source}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(incident.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(incident.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay incidencias disponibles</p>
                  <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Incidencia
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Self-Service</CardTitle>
              <CardDescription>
                Crea y programa reportes personalizados
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Reportes Programables</h3>
              <p className="text-muted-foreground mb-4">
                Esta funcionalidad estará disponible en la siguiente fase
              </p>
              <Button variant="outline" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <VoiceNotesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
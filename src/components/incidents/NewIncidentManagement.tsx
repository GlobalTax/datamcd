import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BarChart3, FileText, Mic, AlertCircle } from 'lucide-react';
import { useNewIncidents } from '@/hooks/useNewIncidents';
import { IncidentFilters } from '@/types/newIncident';
import { MetricsDashboard } from './MetricsDashboard';
import { VoiceNotesManager } from '@/components/voice/VoiceNotesManager';
import { IncidentTrackingPanel } from './IncidentTrackingPanel';
import { NewIncidentDialog } from './NewIncidentDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KanbanBoard } from './KanbanBoard';
import { IncidentsFiltersCompact } from './IncidentsFiltersCompact';

export function NewIncidentManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { incidents, isLoading, error, createIncident, updateIncident } = useNewIncidents(filters);

  // Debug logging
  useEffect(() => {
    console.log('NewIncidentManagement - Component loaded');
    console.log('NewIncidentManagement - Incidents:', incidents);
    console.log('NewIncidentManagement - Loading:', isLoading);
    console.log('NewIncidentManagement - Error:', error);
  }, [incidents, isLoading, error]);

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
      {/* Debug info */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error cargando incidencias: {error.message}
          </AlertDescription>
        </Alert>
      )}
      
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

      <IncidentsFiltersCompact value={filters} onChange={setFilters} />

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
            <div className="text-2xl font-bold text-destructive">{stats.open}</div>
            <p className="text-sm text-muted-foreground">Abiertas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{stats.inProgress}</div>
            <p className="text-sm text-muted-foreground">En Progreso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{stats.resolved}</div>
            <p className="text-sm text-muted-foreground">Resueltas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{stats.critical}</div>
            <p className="text-sm text-muted-foreground">Críticas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="tracking">
            <AlertCircle className="h-4 w-4 mr-2" />
            Seguimiento
          </TabsTrigger>
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
              <CardTitle>Tablero Kanban</CardTitle>
              <CardDescription>
                Vista de incidencias agrupadas por estado, con cambio rápido de estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Cargando incidencias...</p>
                </div>
              ) : (
                <KanbanBoard
                  incidents={incidents || []}
                  onChangeStatus={(id, status) => updateIncident.mutate({ id, status })}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <IncidentTrackingPanel />
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

      {/* Dialog para crear incidencias */}
      <NewIncidentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(data) => createIncident.mutate(data)}
        isLoading={createIncident.isPending}
      />
    </div>
  );
}
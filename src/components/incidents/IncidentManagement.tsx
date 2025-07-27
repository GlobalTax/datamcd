import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useIncidents } from "@/hooks/useIncidents";
import { IncidentDialog } from "./IncidentDialog";
import { IncidentsTable } from "./IncidentsTable";
import { IncidentFilters } from "./IncidentFilters";
import { IncidentType, IncidentPriority, IncidentStatus } from "@/types/incident";

export const IncidentManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: undefined as IncidentStatus | undefined,
    priority: undefined as IncidentPriority | undefined,
    type: undefined as IncidentType | undefined,
    restaurantId: undefined as string | undefined,
  });

  const { incidents, isLoading, createIncident } = useIncidents(filters.restaurantId);

  // Filtrar incidencias según los filtros aplicados
  const filteredIncidents = incidents?.filter(incident => {
    if (filters.status && incident.status !== filters.status) return false;
    if (filters.priority && incident.priority !== filters.priority) return false;
    if (filters.type && incident.incident_type !== filters.type) return false;
    return true;
  }) || [];

  // Estadísticas de incidencias
  const stats = {
    total: filteredIncidents.length,
    open: filteredIncidents.filter(i => i.status === 'open').length,
    inProgress: filteredIncidents.filter(i => i.status === 'in_progress').length,
    resolved: filteredIncidents.filter(i => i.status === 'resolved').length,
    critical: filteredIncidents.filter(i => i.priority === 'critical').length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div></div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Incidencia
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltas</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <IncidentFilters filters={filters} onFiltersChange={setFilters} />

      {/* Tabla de incidencias */}
      <Card>
        <CardHeader>
          <CardTitle>Incidencias</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentsTable incidents={filteredIncidents} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Dialog para crear incidencia */}
      <IncidentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={createIncident.mutate}
        isLoading={createIncident.isPending}
      />
    </div>
  );
};
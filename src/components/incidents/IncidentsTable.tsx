import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RestaurantIncident, IncidentPriority, IncidentStatus } from "@/types/incident";
import { IncidentDetailDialog } from "./IncidentDetailDialog";
import { IncidentDialog } from "./IncidentDialog";
import { useIncidents } from "@/hooks/useIncidents";

interface IncidentsTableProps {
  incidents: any[];
  isLoading: boolean;
}

const getPriorityColor = (priority: IncidentPriority) => {
  switch (priority) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'default';
  }
};

const getStatusColor = (status: IncidentStatus) => {
  switch (status) {
    case 'open':
      return 'destructive';
    case 'in_progress':
      return 'default';
    case 'resolved':
      return 'default';
    case 'closed':
      return 'secondary';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: IncidentStatus) => {
  switch (status) {
    case 'open':
      return 'Abierta';
    case 'in_progress':
      return 'En Progreso';
    case 'resolved':
      return 'Resuelta';
    case 'closed':
      return 'Cerrada';
    default:
      return status;
  }
};

const getPriorityLabel = (priority: IncidentPriority) => {
  switch (priority) {
    case 'critical':
      return 'Crítica';
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Media';
    case 'low':
      return 'Baja';
    default:
      return priority;
  }
};

export const IncidentsTable = ({ incidents, isLoading }: IncidentsTableProps) => {
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [editingIncident, setEditingIncident] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { updateIncident, deleteIncident } = useIncidents();

  const handleView = (incident: any) => {
    setSelectedIncident(incident);
    setShowDetailDialog(true);
  };

  const handleEdit = (incident: any) => {
    setEditingIncident(incident);
    setShowEditDialog(true);
  };

  const handleDelete = (incident: any) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta incidencia?')) {
      deleteIncident.mutate(incident.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!incidents?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay incidencias registradas</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Restaurante</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Ingeniero</TableHead>
            <TableHead>Clasificación</TableHead>
            <TableHead>Participante</TableHead>
            <TableHead>Periodo</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Asignado a</TableHead>
            <TableHead>Reportado por</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead>Fecha Resolución</TableHead>
            <TableHead>Fecha Cierre</TableHead>
            <TableHead className="w-[70px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-mono text-xs">
                {incident.id.slice(0, 8)}...
              </TableCell>
              <TableCell className="font-medium max-w-xs">
                <div className="truncate">{incident.title}</div>
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="truncate text-sm text-muted-foreground">
                  {incident.description || 'Sin descripción'}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {incident.restaurant?.name || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">
                  #{incident.restaurant?.site_number}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {incident.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityColor(incident.priority)}>
                  {getPriorityLabel(incident.priority)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(incident.status)}>
                  {getStatusLabel(incident.status)}
                </Badge>
              </TableCell>
              <TableCell>{incident.ingeniero || 'N/A'}</TableCell>
              <TableCell>{incident.clasificacion || 'N/A'}</TableCell>
              <TableCell>{incident.participante || 'N/A'}</TableCell>
              <TableCell>{incident.periodo || 'N/A'}</TableCell>
              <TableCell>
                {incident.importe_carto ? (
                  <span className="font-medium">
                    €{incident.importe_carto.toFixed(2)}
                  </span>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {incident.source}
                </Badge>
              </TableCell>
              <TableCell>{incident.assigned_to || 'No asignado'}</TableCell>
              <TableCell>{incident.reported_by || 'N/A'}</TableCell>
              <TableCell>
                {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
              </TableCell>
              <TableCell>
                {incident.resolved_at ? (
                  format(new Date(incident.resolved_at), 'dd/MM/yyyy HH:mm', { locale: es })
                ) : (
                  'Pendiente'
                )}
              </TableCell>
              <TableCell>
                {incident.fecha_cierre ? (
                  format(new Date(incident.fecha_cierre), 'dd/MM/yyyy HH:mm', { locale: es })
                ) : (
                  'Abierta'
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(incident)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(incident)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(incident)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialogs */}
      <IncidentDetailDialog
        incident={selectedIncident}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      <IncidentDialog
        incident={editingIncident}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={(data) => updateIncident.mutate({ id: editingIncident.id, ...data })}
        isLoading={updateIncident.isPending}
      />
    </>
  );
};
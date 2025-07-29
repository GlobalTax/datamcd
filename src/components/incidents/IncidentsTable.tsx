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
            <TableHead>Título</TableHead>
            <TableHead>Restaurante</TableHead>
            <TableHead>Ingeniero</TableHead>
            <TableHead>Clasificación</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[70px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="font-medium">{incident.title}</TableCell>
              <TableCell>
                {incident.restaurant?.base_restaurant?.restaurant_name || 'N/A'} 
                <br />
                <span className="text-sm text-muted-foreground">
                  #{incident.restaurant?.base_restaurant?.site_number}
                </span>
              </TableCell>
              <TableCell>{incident.ingeniero || 'N/A'}</TableCell>
              <TableCell>{incident.clasificacion || incident.incident_type}</TableCell>
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
              <TableCell>
                {incident.importe_carto ? `€${incident.importe_carto.toFixed(2)}` : 'N/A'}
              </TableCell>
              <TableCell>
                {format(new Date(incident.created_at), 'dd/MM/yyyy', { locale: es })}
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
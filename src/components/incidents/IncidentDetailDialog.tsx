import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, User, Building, AlertTriangle } from "lucide-react";

interface IncidentDetailDialogProps {
  incident: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IncidentDetailDialog = ({
  incident,
  open,
  onOpenChange,
}: IncidentDetailDialogProps) => {
  if (!incident) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
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

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  const getPriorityLabel = (priority: string) => {
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'equipment':
        return 'Equipamiento';
      case 'staff':
        return 'Personal';
      case 'customer':
        return 'Cliente';
      case 'safety':
        return 'Seguridad';
      case 'hygiene':
        return 'Higiene';
      case 'general':
        return 'General';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{incident.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado y Prioridad */}
          <div className="flex gap-4">
            <Badge variant={getStatusColor(incident.status)} className="text-sm">
              {getStatusLabel(incident.status)}
            </Badge>
            <Badge variant={getPriorityColor(incident.priority)} className="text-sm">
              {getPriorityLabel(incident.priority)}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {getTypeLabel(incident.incident_type)}
            </Badge>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  Restaurante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {incident.restaurant?.base_restaurant?.restaurant_name || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  #{incident.restaurant?.base_restaurant?.site_number}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Reportado por
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {incident.reported_user?.full_name || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </CardContent>
            </Card>

            {incident.assigned_user && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Asignado a
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{incident.assigned_user.full_name}</p>
                </CardContent>
              </Card>
            )}

            {incident.estimated_resolution && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Resolución estimada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {format(new Date(incident.estimated_resolution), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Descripción */}
          {incident.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{incident.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Notas de resolución */}
          {incident.resolution_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notas de resolución</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{incident.resolution_notes}</p>
                {incident.resolved_at && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Resuelto el {format(new Date(incident.resolved_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cronología</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Incidencia creada</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>

                {incident.updated_at !== incident.created_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Última actualización</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(incident.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </div>
                )}

                {incident.resolved_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Incidencia resuelta</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(incident.resolved_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
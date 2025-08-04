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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  MessageSquare, 
  FileText,
  Search,
  SortAsc,
  SortDesc
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RestaurantIncident, IncidentPriority, IncidentStatus } from "@/types/incident";
import { IncidentDetailDialog } from "./IncidentDetailDialog";
import { IncidentDialog } from "./IncidentDialog";
import { useIncidents } from "@/hooks/useIncidents";
import * as XLSX from 'xlsx';

interface IncidentsTableProps {
  incidents: any[];
  isLoading: boolean;
}

type SortField = 'numero_secuencial' | 'created_at' | 'status' | 'priority' | 'importe_carto';
type SortOrder = 'asc' | 'desc';

interface CommentHistoryItem {
  fecha: string;
  comentario: string;
  usuario_id?: string;
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
      return 'destructive'; // Rojo para abierta
    case 'in_progress':
      return 'default'; // Azul para en progreso
    case 'resolved':
      return 'default';
    case 'closed':
      return 'default'; // Verde para cerrada
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
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [selectedIncidentForComments, setSelectedIncidentForComments] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('numero_secuencial');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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

  const handleShowComments = (incident: any) => {
    setSelectedIncidentForComments(incident);
    setShowCommentsDialog(true);
  };

  const handleExportToExcel = () => {
    const exportData = filteredAndSortedIncidents.map(incident => ({
      'SI': incident.numero_secuencial || '',
      'Nombre': incident.restaurant?.name || '',
      'Descripción': incident.description || '',
      'Estado': getStatusLabel(incident.status),
      'Participante': incident.participante || '',
      'Fecha Cierre': incident.fecha_cierre ? format(new Date(incident.fecha_cierre), 'dd/MM/yyyy', { locale: es }) : '',
      'Comentarios': incident.comentarios_cierre || '',
      'Núm. Pedido': incident.numero_pedido || '',
      'Importe CAP': incident.importe_carto || '',
      'Documento': incident.documento_url || '',
      'Ingeniero': incident.ingeniero || '',
      'Clasificación': incident.clasificacion || '',
      'Periodo': incident.periodo || '',
      'Prioridad': getPriorityLabel(incident.priority),
      'Tipo': incident.type,
      'Fecha Creación': format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm', { locale: es }),
      'Asignado a': incident.assigned_to || '',
      'Reportado por': incident.reported_by || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Incidencias');
    
    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 8 },  // SI
      { wch: 20 }, // Nombre
      { wch: 30 }, // Descripción
      { wch: 12 }, // Estado
      { wch: 15 }, // Participante
      { wch: 12 }, // Fecha Cierre
      { wch: 25 }, // Comentarios
      { wch: 12 }, // Núm. Pedido
      { wch: 12 }, // Importe CAP
      { wch: 15 }, // Documento
      { wch: 15 }, // Ingeniero
      { wch: 15 }, // Clasificación
      { wch: 12 }, // Periodo
      { wch: 10 }, // Prioridad
      { wch: 15 }, // Tipo
      { wch: 18 }, // Fecha Creación
      { wch: 15 }, // Asignado a
      { wch: 15 }  // Reportado por
    ];
    ws['!cols'] = columnWidths;

    XLSX.writeFile(wb, `incidencias_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrar y ordenar incidencias
  const filteredAndSortedIncidents = incidents
    .filter(incident => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        incident.title?.toLowerCase().includes(searchLower) ||
        incident.description?.toLowerCase().includes(searchLower) ||
        incident.restaurant?.name?.toLowerCase().includes(searchLower) ||
        incident.participante?.toLowerCase().includes(searchLower) ||
        incident.ingeniero?.toLowerCase().includes(searchLower) ||
        incident.comentarios_cierre?.toLowerCase().includes(searchLower) ||
        incident.numero_pedido?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'numero_secuencial':
          aValue = a.numero_secuencial || 0;
          bValue = b.numero_secuencial || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'importe_carto':
          aValue = a.importe_carto || 0;
          bValue = b.importe_carto || 0;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium"
    >
      {children}
      {sortField === field && (
        sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
      )}
    </Button>
  );

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const ExpandableCell = ({ text, maxLength = 50 }: { text: string; maxLength?: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!text || text.length <= maxLength) {
      return <span className="text-sm">{text || 'N/A'}</span>;
    }
    
    return (
      <div className="space-y-1">
        <span className="text-sm">
          {isExpanded ? text : truncateText(text, maxLength)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-0 text-xs text-primary hover:text-primary/80"
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </Button>
      </div>
    );
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
      {/* Barra de herramientas */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Gestión de Incidencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en título, descripción, restaurante, participante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportToExcel}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredAndSortedIncidents.length} de {incidents.length} incidencias
          </div>
        </CardContent>
      </Card>

      {/* Tabla con scroll horizontal */}
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">
                <SortButton field="numero_secuencial">SI</SortButton>
              </TableHead>
              <TableHead className="min-w-[200px]">Nombre</TableHead>
              <TableHead className="min-w-[250px]">Descripción</TableHead>
              <TableHead className="w-[120px]">
                <SortButton field="status">Estado</SortButton>
              </TableHead>
              <TableHead className="min-w-[150px]">Participante</TableHead>
              <TableHead className="w-[100px]">F. Cierre</TableHead>
              <TableHead className="min-w-[200px]">Comentarios</TableHead>
              <TableHead className="w-[100px]">Núm. Pedido</TableHead>
              <TableHead className="w-[120px]">
                <SortButton field="importe_carto">Importe CAP</SortButton>
              </TableHead>
              <TableHead className="min-w-[120px]">Documento</TableHead>
              <TableHead className="min-w-[120px]">Ingeniero</TableHead>
              <TableHead className="min-w-[120px]">Clasificación</TableHead>
              <TableHead className="w-[100px]">Periodo</TableHead>
              <TableHead className="w-[100px]">
                <SortButton field="priority">Prioridad</SortButton>
              </TableHead>
              <TableHead className="w-[120px]">Tipo</TableHead>
              <TableHead className="w-[130px]">
                <SortButton field="created_at">F. Creación</SortButton>
              </TableHead>
              <TableHead className="min-w-[120px]">Asignado a</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedIncidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell className="font-mono text-sm font-medium">
                  {incident.numero_secuencial || '-'}
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {incident.restaurant?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    #{incident.restaurant?.site_number}
                  </div>
                </TableCell>
                <TableCell className="max-w-[250px]">
                  <ExpandableCell text={incident.description} maxLength={60} />
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusColor(incident.status)}
                    className={incident.status === 'closed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                  >
                    {getStatusLabel(incident.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{incident.participante || 'N/A'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {incident.fecha_cierre ? (
                      format(new Date(incident.fecha_cierre), 'dd/MM/yy', { locale: es })
                    ) : (
                      '-'
                    )}
                  </span>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <ExpandableCell text={incident.comentarios_cierre} maxLength={40} />
                    {(incident.comentarios_historial?.length > 0 || incident.comentarios_cierre) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShowComments(incident)}
                        className="h-auto p-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono">{incident.numero_pedido || '-'}</span>
                </TableCell>
                <TableCell>
                  {incident.importe_carto ? (
                    <span className="font-medium text-sm">
                      €{incident.importe_carto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {incident.documento_url ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(incident.documento_url, '_blank')}
                      className="h-auto p-1"
                    >
                      <FileText className="h-3 w-3" />
                    </Button>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{incident.ingeniero || 'N/A'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{incident.clasificacion || 'N/A'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{incident.periodo || 'N/A'}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(incident.priority)} className="text-xs">
                    {getPriorityLabel(incident.priority)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {incident.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {format(new Date(incident.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{incident.assigned_to || 'No asignado'}</span>
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
                      {(incident.comentarios_historial?.length > 0 || incident.comentarios_cierre) && (
                        <DropdownMenuItem onClick={() => handleShowComments(incident)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Ver comentarios
                        </DropdownMenuItem>
                      )}
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
      </div>

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

      {/* Dialog de Historial de Comentarios */}
      <Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historial de Comentarios</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4">
              {selectedIncidentForComments && (
                <>
                  <div className="text-sm text-muted-foreground mb-4">
                    <strong>Incidencia:</strong> {selectedIncidentForComments.title}
                    <br />
                    <strong>SI:</strong> {selectedIncidentForComments.numero_secuencial || 'N/A'}
                  </div>
                  
                  {/* Comentario actual */}
                  {selectedIncidentForComments.comentarios_cierre && (
                    <div className="border-l-4 border-primary pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">Comentario Actual</Badge>
                        <span className="text-xs text-muted-foreground">
                          {selectedIncidentForComments.fecha_cierre ? 
                            format(new Date(selectedIncidentForComments.fecha_cierre), 'dd/MM/yyyy HH:mm', { locale: es }) :
                            'Fecha no disponible'
                          }
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedIncidentForComments.comentarios_cierre}
                      </p>
                    </div>
                  )}

                  {/* Historial de comentarios */}
                  {selectedIncidentForComments.comentarios_historial && 
                   selectedIncidentForComments.comentarios_historial.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Historial</h4>
                        {selectedIncidentForComments.comentarios_historial
                          .sort((a: CommentHistoryItem, b: CommentHistoryItem) => 
                            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                          )
                          .map((comment: CommentHistoryItem, index: number) => (
                            <div key={index} className="border-l-2 border-muted pl-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  Comentario {selectedIncidentForComments.comentarios_historial.length - index}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(comment.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                {comment.comentario}
                              </p>
                            </div>
                        ))}
                      </div>
                    </>
                  )}

                  {!selectedIncidentForComments.comentarios_cierre && 
                   (!selectedIncidentForComments.comentarios_historial || 
                    selectedIncidentForComments.comentarios_historial.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay comentarios disponibles para esta incidencia</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
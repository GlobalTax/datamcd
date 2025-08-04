import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  Clock, 
  MessageSquare, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Plus,
  Eye,
  Edit,
  ArrowRight,
  List,
  Grid
} from 'lucide-react';
import { useNewIncidents } from '@/hooks/useNewIncidents';
import { IncidentsTable } from './IncidentsTable';
import { NewIncidentDialog } from './NewIncidentDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface IncidentComment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  is_internal: boolean;
  user?: {
    full_name?: string;
    email?: string;
  };
}

interface IncidentDetails {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  type: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  estimated_resolution?: string;
  assigned_to?: string;
  reported_by?: string;
  restaurant_id?: string;
  resolution_notes?: string;
  comments?: IncidentComment[];
  restaurant?: {
    restaurant_name?: string;
  };
  assigned_user?: {
    full_name?: string;
    email?: string;
  };
  reporter?: {
    full_name?: string;
    email?: string;
  };
}

const STATUS_CONFIG = {
  'open': { label: 'Abierta', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  'in_progress': { label: 'En Progreso', color: 'bg-yellow-100 text-yellow-800', icon: PlayCircle },
  'pending': { label: 'Pendiente', color: 'bg-orange-100 text-orange-800', icon: PauseCircle },
  'resolved': { label: 'Resuelta', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'closed': { label: 'Cerrada', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const PRIORITY_CONFIG = {
  'low': { label: 'Baja', color: 'bg-blue-100 text-blue-800' },
  'medium': { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  'high': { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  'critical': { label: 'Crítica', color: 'bg-red-100 text-red-800' },
};

export function IncidentTrackingPanel() {
  const { incidents, isLoading, error, createIncident } = useNewIncidents();
  const [activeView, setActiveView] = useState('table'); // 'cards' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');
  const [selectedIncident, setSelectedIncident] = useState<IncidentDetails | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [incidentComments, setIncidentComments] = useState<IncidentComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filtrar incidencias
  const filteredIncidents = useMemo(() => {
    if (!incidents) return [];
    
    return incidents.filter(incident => {
      const matchesSearch = incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           incident.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || incident.status === statusFilter;
      const matchesPriority = priorityFilter === 'todos' || incident.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [incidents, searchTerm, statusFilter, priorityFilter]);

  // Estadísticas
  const stats = useMemo(() => {
    if (!incidents) return { total: 0, abiertas: 0, enProgreso: 0, resueltas: 0, criticas: 0 };
    
    return {
      total: incidents.length,
      abiertas: incidents.filter(i => i.status === 'open').length,
      enProgreso: incidents.filter(i => i.status === 'in_progress').length,
      resueltas: incidents.filter(i => i.status === 'resolved').length,
      criticas: incidents.filter(i => i.priority === 'critical').length,
    };
  }, [incidents]);

  // Cargar comentarios de una incidencia
  const loadIncidentComments = async (incidentId: string) => {
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('incident_comments')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Obtener información de usuarios por separado
      const userIds = [...new Set((data || []).map(comment => comment.user_id))];
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const usersMap = (users || []).reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, any>);
      
      const commentsWithUser = (data || []).map(comment => ({
        ...comment,
        user: usersMap[comment.user_id] || undefined
      }));
      
      setIncidentComments(commentsWithUser);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Agregar comentario
  const addComment = async () => {
    if (!selectedIncident || !newComment.trim()) return;
    
    setIsAddingComment(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('incident_comments')
        .insert({
          incident_id: selectedIncident.id,
          user_id: user.id,
          comment: newComment.trim(),
          is_internal: false
        });

      if (error) throw error;

      setNewComment('');
      await loadIncidentComments(selectedIncident.id);
      toast.success('Comentario agregado');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al agregar comentario');
    } finally {
      setIsAddingComment(false);
    }
  };

  // Cambiar estado de incidencia
  const updateIncidentStatus = async (incidentId: string, newStatus: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'resolved' || newStatus === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', incidentId);

      if (error) throw error;

      toast.success('Estado actualizado');
      // Refrescar datos si es necesario
      
      // Si hay una incidencia seleccionada, actualizarla
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident({ ...selectedIncident, status: newStatus, ...updateData });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  // Abrir detalles de incidencia
  const openIncidentDetails = async (incident: any) => {
    setSelectedIncident(incident);
    setShowDetailsDialog(true);
    await loadIncidentComments(incident.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar las incidencias. Por favor, intenta de nuevo.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abiertas</p>
                <p className="text-2xl font-bold text-red-600">{stats.abiertas}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Progreso</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.enProgreso}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resueltas</p>
                <p className="text-2xl font-bold text-green-600">{stats.resueltas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Controles */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar incidencias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los Estados</SelectItem>
                  <SelectItem value="open">Abierta</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="resolved">Resuelta</SelectItem>
                  <SelectItem value="closed">Cerrada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las Prioridades</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={activeView === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('cards')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeView === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Incidencia
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista de Incidencias */}
      {activeView === 'table' ? (
        <IncidentsTable 
          incidents={filteredIncidents || []} 
          isLoading={isLoading} 
        />
      ) : (
        <div className="grid gap-4">
          {filteredIncidents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay incidencias</h3>
                <p className="text-muted-foreground mb-4">
                  No se encontraron incidencias que coincidan con los filtros aplicados.
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Primera Incidencia
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredIncidents.map((incident) => {
              const StatusIcon = STATUS_CONFIG[incident.status as keyof typeof STATUS_CONFIG]?.icon || AlertTriangle;
              const statusConfig = STATUS_CONFIG[incident.status as keyof typeof STATUS_CONFIG];
              const priorityConfig = PRIORITY_CONFIG[incident.priority as keyof typeof PRIORITY_CONFIG];

              return (
                <Card key={incident.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <StatusIcon className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-semibold text-lg">{incident.title}</h3>
                          {incident.numero_secuencial && (
                            <Badge variant="outline">
                              SI: {incident.numero_secuencial}
                            </Badge>
                          )}
                          <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
                            {statusConfig?.label || incident.status}
                          </Badge>
                          <Badge className={priorityConfig?.color || 'bg-gray-100 text-gray-800'}>
                            {priorityConfig?.label || incident.priority}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground line-clamp-2">
                          {incident.description || 'Sin descripción'}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Creada: {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                          </div>
                          {incident.restaurant?.name && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{incident.restaurant.name}</span>
                            </div>
                          )}
                          {incident.participante && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>Participante: {incident.participante}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Select 
                          value={incident.status} 
                          onValueChange={(value) => updateIncidentStatus(incident.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Abierta</SelectItem>
                            <SelectItem value="in_progress">En Progreso</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="resolved">Resuelta</SelectItem>
                            <SelectItem value="closed">Cerrada</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openIncidentDetails(incident)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Dialog de Detalles */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Seguimiento de Incidencia
            </DialogTitle>
          </DialogHeader>

          {selectedIncident && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(90vh-120px)]">
              {/* Información de la Incidencia */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Título</label>
                      <p className="font-medium">{selectedIncident.title}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                      <p className="text-sm">{selectedIncident.description || 'Sin descripción'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Estado</label>
                        <Badge className={STATUS_CONFIG[selectedIncident.status as keyof typeof STATUS_CONFIG]?.color}>
                          {STATUS_CONFIG[selectedIncident.status as keyof typeof STATUS_CONFIG]?.label}
                        </Badge>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
                        <Badge className={PRIORITY_CONFIG[selectedIncident.priority as keyof typeof PRIORITY_CONFIG]?.color}>
                          {PRIORITY_CONFIG[selectedIncident.priority as keyof typeof PRIORITY_CONFIG]?.label}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Creada</label>
                      <p className="text-sm">{format(new Date(selectedIncident.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                    </div>

                    {selectedIncident.estimated_resolution && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Resolución Estimada</label>
                        <p className="text-sm">{format(new Date(selectedIncident.estimated_resolution), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                      </div>
                    )}

                    {selectedIncident.resolution_notes && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Notas de Resolución</label>
                        <p className="text-sm">{selectedIncident.resolution_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Comentarios y Timeline */}
              <div className="space-y-4">
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Seguimiento y Comentarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 pr-4">
                      {isLoadingComments ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-12 bg-gray-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : incidentComments.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No hay comentarios aún
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {incidentComments.map((comment) => (
                            <div key={comment.id} className="border-l-2 border-muted pl-4 pb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {comment.user?.full_name || comment.user?.email || 'Usuario'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(comment.created_at), 'dd/MM HH:mm', { locale: es })}
                                </span>
                                {comment.is_internal && (
                                  <Badge variant="secondary" className="text-xs">Interno</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    <Separator className="my-4" />
                    
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Agregar comentario de seguimiento..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button 
                        onClick={addComment}
                        disabled={!newComment.trim() || isAddingComment}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {isAddingComment ? 'Agregando...' : 'Agregar Comentario'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
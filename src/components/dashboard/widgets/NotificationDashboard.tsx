
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Bell, 
  Search, 
  Calendar as CalendarIcon,
  Filter,
  Archive,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { useAdvancedHRNotifications, type AdvancedHRNotification } from '@/hooks/useAdvancedHRNotifications';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationDashboardProps {
  franchiseeId?: string;
}

export const NotificationDashboard: React.FC<NotificationDashboardProps> = ({
  franchiseeId
}) => {
  const {
    notifications,
    settings,
    loading,
    markAsRead,
    dismissNotification,
    unreadCount,
    criticalCount,
    categories
  } = useAdvancedHRNotifications(franchiseeId);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date>();
  const [selectedTab, setSelectedTab] = useState('all');

  // Estadísticas de notificaciones
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    critical: criticalCount,
    actionRequired: notifications.filter(n => n.actionRequired).length,
    byPriority: {
      critical: notifications.filter(n => n.priority === 'critical').length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length
    },
    byCategory: {
      legal: categories.legal.length,
      hr: categories.hr.length,
      system: categories.system.length,
      operational: categories.operational.length
    }
  };

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
                       new Date(notification.date).toDateString() === dateFilter.toDateString();
    
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'unread' && !notification.isRead) ||
                      (selectedTab === 'critical' && notification.priority === 'critical') ||
                      (selectedTab === 'action' && notification.actionRequired) ||
                      notification.category === selectedTab;

    return matchesSearch && matchesDate && matchesTab;
  });

  const getNotificationIcon = (type: AdvancedHRNotification['type']) => {
    // Reutilizar la misma lógica del componente anterior
    const iconMap = {
      contract_expiring: CheckCircle,
      birthday: Activity,
      anniversary: CalendarIcon,
      vacation_pending: CalendarIcon,
      overtime_alert: Clock,
      attendance_irregular: XCircle,
      document_expiring: AlertTriangle,
      high_turnover: TrendingUp,
      sync_failure: Activity,
      performance_review: BarChart3,
      legal_compliance: AlertTriangle
    };
    
    const IconComponent = iconMap[type] || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sin leer</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acción requerida</p>
                <p className="text-2xl font-bold text-orange-600">{stats.actionRequired}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Centro de Notificaciones
              </CardTitle>
              <CardDescription>
                Gestión avanzada de alertas y recordatorios del sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => notifications.filter(n => !n.isRead).forEach(n => markAsRead(n.id))}
                disabled={unreadCount === 0}
              >
                Marcar todas como leídas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Controles de filtro */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, 'PP', { locale: es }) : 'Filtrar por fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDateFilter(undefined)}
                    className="w-full"
                  >
                    Limpiar filtro
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tabs de categorías */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
              <TabsTrigger value="unread">Sin leer ({stats.unread})</TabsTrigger>
              <TabsTrigger value="critical">Críticas ({stats.critical})</TabsTrigger>
              <TabsTrigger value="legal">Legal ({stats.byCategory.legal})</TabsTrigger>
              <TabsTrigger value="hr">RRHH ({stats.byCategory.hr})</TabsTrigger>
              <TabsTrigger value="system">Sistema ({stats.byCategory.system})</TabsTrigger>
              <TabsTrigger value="operational">Operativo ({stats.byCategory.operational})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card key={notification.id} className={`${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-full bg-muted">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{notification.title}</h3>
                                <Badge variant={notification.priority === 'critical' ? 'destructive' : 'secondary'}>
                                  {notification.priority}
                                </Badge>
                                <Badge variant="outline">
                                  {notification.category}
                                </Badge>
                                {!notification.isRead && (
                                  <Badge>Nueva</Badge>
                                )}
                                {notification.actionRequired && (
                                  <Badge variant="outline">Acción requerida</Badge>
                                )}
                              </div>
                              
                              <p className="text-muted-foreground">{notification.message}</p>
                              
                              {notification.employeeName && (
                                <p className="text-sm font-medium">
                                  Empleado: {notification.employeeName}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{format(new Date(notification.date), 'PPp', { locale: es })}</span>
                                {notification.dueDate && (
                                  <span className="text-red-600">
                                    Vence: {format(new Date(notification.dueDate), 'PP', { locale: es })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Marcar como leída
                              </Button>
                            )}
                            {notification.canDismiss && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => dismissNotification(notification.id)}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredNotifications.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No hay notificaciones</p>
                      <p>No se encontraron notificaciones que coincidan con los filtros seleccionados</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

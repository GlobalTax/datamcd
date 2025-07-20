
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Calendar, 
  AlertTriangle, 
  Gift, 
  Clock,
  FileText,
  X,
  Settings,
  Users,
  AlertCircle,
  Activity,
  Server,
  Eye,
  Filter,
  Archive
} from 'lucide-react';
import { useAdvancedHRNotifications, type AdvancedHRNotification } from '@/hooks/useAdvancedHRNotifications';

interface AdvancedHRNotificationsProps {
  franchiseeId?: string;
  onViewAll?: () => void;
}

export const AdvancedHRNotifications: React.FC<AdvancedHRNotificationsProps> = ({
  franchiseeId,
  onViewAll
}) => {
  const {
    notifications,
    settings,
    loading,
    markAsRead,
    dismissNotification,
    updateSettings,
    unreadCount,
    criticalCount,
    categories
  } = useAdvancedHRNotifications(franchiseeId);

  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getNotificationIcon = (type: AdvancedHRNotification['type']) => {
    switch (type) {
      case 'contract_expiring':
      case 'document_expiring':
        return <FileText className="h-4 w-4" />;
      case 'birthday':
        return <Gift className="h-4 w-4" />;
      case 'anniversary':
      case 'performance_review':
        return <Calendar className="h-4 w-4" />;
      case 'vacation_pending':
        return <Calendar className="h-4 w-4" />;
      case 'overtime_alert':
      case 'attendance_irregular':
        return <Clock className="h-4 w-4" />;
      case 'high_turnover':
        return <Users className="h-4 w-4" />;
      case 'sync_failure':
        return <Server className="h-4 w-4" />;
      case 'legal_compliance':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: AdvancedHRNotification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800 border-l-4 border-l-red-500';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800 border-l-4 border-l-orange-500';
      case 'medium':
        return 'bg-blue-50 border-blue-200 text-blue-800 border-l-4 border-l-blue-500';
      case 'low':
        return 'bg-gray-50 border-gray-200 text-gray-800 border-l-4 border-l-gray-500';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'legal': return 'bg-red-100 text-red-700 border-red-200';
      case 'hr': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'system': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'operational': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (showOnlyUnread && notification.isRead) return false;
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) return false;
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones RRHH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones RRHH
            {criticalCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {criticalCount} críticas
              </Badge>
            )}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {unreadCount} nuevas
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Sistema avanzado de alertas y recordatorios
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Configuración de Notificaciones</SheetTitle>
                <SheetDescription>
                  Personaliza qué alertas y recordatorios quieres recibir
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="overtime-alerts">Alertas de horas extras</Label>
                    <Switch
                      id="overtime-alerts"
                      checked={settings.enableOvertimeAlerts}
                      onCheckedChange={(checked) => updateSettings({ enableOvertimeAlerts: checked })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="overtime-threshold">Umbral de horas extras (h/semana)</Label>
                    <Input
                      id="overtime-threshold"
                      type="number"
                      value={settings.overtimeThreshold}
                      onChange={(e) => updateSettings({ overtimeThreshold: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contract-warning">Días de aviso para contratos</Label>
                    <Input
                      id="contract-warning"
                      type="number"
                      value={settings.contractExpiryWarningDays}
                      onChange={(e) => updateSettings({ contractExpiryWarningDays: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-alerts">Alertas de sistema</Label>
                    <Switch
                      id="system-alerts"
                      checked={settings.enableSystemAlerts}
                      onCheckedChange={(checked) => updateSettings({ enableSystemAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="critical-only">Solo alertas críticas</Label>
                    <Switch
                      id="critical-only"
                      checked={settings.criticalAlertsOnly}
                      onCheckedChange={(checked) => updateSettings({ criticalAlertsOnly: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Notificaciones por email</Label>
                    <Switch
                      id="email-notifications"
                      checked={settings.enableEmailNotifications}
                      onCheckedChange={(checked) => updateSettings({ enableEmailNotifications: checked })}
                    />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {notifications.length > 5 && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              Ver Todas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={showOnlyUnread ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              >
                <Eye className="h-3 w-3 mr-1" />
                No leídas ({unreadCount})
              </Button>
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                <TabsTrigger value="legal" className="text-xs">Legal</TabsTrigger>
                <TabsTrigger value="hr" className="text-xs">RRHH</TabsTrigger>
                <TabsTrigger value="system" className="text-xs">Sistema</TabsTrigger>
                <TabsTrigger value="operational" className="text-xs">Operativo</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Lista de notificaciones */}
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {filteredNotifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-3 rounded-lg border ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? 'font-medium' : 'opacity-75'
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-1 rounded-full bg-white">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCategoryColor(notification.category)}`}
                          >
                            {notification.category.toUpperCase()}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge variant="outline" className="text-xs">
                              Acción Requerida
                            </Badge>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm opacity-90 break-words">{notification.message}</p>
                        {notification.employeeName && (
                          <p className="text-xs font-medium mt-1">
                            Empleado: {notification.employeeName}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs opacity-75">
                            {new Date(notification.date).toLocaleDateString()}
                          </p>
                          {notification.dueDate && (
                            <p className="text-xs text-red-600">
                              Vence: {new Date(notification.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {notification.canDismiss && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay notificaciones {showOnlyUnread ? 'sin leer' : 'para mostrar'}</p>
                </div>
              )}

              {filteredNotifications.length > 10 && (
                <div className="text-center py-4">
                  <Button variant="outline" onClick={onViewAll}>
                    <Archive className="h-4 w-4 mr-2" />
                    Ver {filteredNotifications.length - 10} notificaciones más
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Resumen por categorías */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t">
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <div className="text-sm font-semibold text-red-700">{categories.legal.length}</div>
              <div className="text-xs text-red-600">Legal</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-sm font-semibold text-blue-700">{categories.hr.length}</div>
              <div className="text-xs text-blue-600">RRHH</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="text-sm font-semibold text-purple-700">{categories.system.length}</div>
              <div className="text-xs text-purple-600">Sistema</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-sm font-semibold text-green-700">{categories.operational.length}</div>
              <div className="text-xs text-green-600">Operativo</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Filter,
  Calendar,
  Euro,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'contract_expiry' | 'payment_overdue' | 'new_registration' | 'performance_alert' | 'system_update';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  entityId?: string;
  entityType?: 'franchisee' | 'restaurant' | 'contract' | 'payment';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'contract_expiry',
    priority: 'high',
    title: 'Contrato próximo a vencer',
    description: 'El contrato de McDonald\'s Goya vence en 15 días. Requiere renovación urgente.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionRequired: true,
    entityId: 'restaurant-1',
    entityType: 'restaurant'
  },
  {
    id: '2',
    type: 'payment_overdue',
    priority: 'high',
    title: 'Pago atrasado',
    description: 'Franquiciado Juan Pérez tiene royalties pendientes por €12,500',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionRequired: true,
    entityId: 'franchisee-1',
    entityType: 'franchisee'
  },
  {
    id: '3',
    type: 'new_registration',
    priority: 'medium',
    title: 'Nuevo restaurante registrado',
    description: 'Se ha registrado McDonald\'s Malasaña en Madrid',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionRequired: false,
    entityId: 'restaurant-2',
    entityType: 'restaurant'
  },
  {
    id: '4',
    type: 'performance_alert',
    priority: 'medium',
    title: 'Bajo rendimiento detectado',
    description: 'McDonald\'s Centro tiene una caída del 15% en ventas este mes',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionRequired: false,
    entityId: 'restaurant-3',
    entityType: 'restaurant'
  },
  {
    id: '5',
    type: 'system_update',
    priority: 'low',
    title: 'Actualización del sistema',
    description: 'Nueva versión del panel disponible con mejoras de rendimiento',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionRequired: false
  }
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'action_required'>('all');
  const [loading, setLoading] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contract_expiry': return <Calendar className="w-4 h-4" />;
      case 'payment_overdue': return <Euro className="w-4 h-4" />;
      case 'new_registration': return <Users className="w-4 h-4" />;
      case 'performance_alert': return <AlertTriangle className="w-4 h-4" />;
      case 'system_update': return <Info className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 border-destructive/20';
      case 'medium': return 'bg-primary/10 border-primary/20';
      case 'low': return 'bg-secondary/10 border-secondary/20';
      default: return 'bg-muted/50';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    toast.success('Notificación eliminada');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.read;
      case 'action_required': return notif.actionRequired;
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${diffDays}d`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centro de Notificaciones</h1>
          <p className="text-muted-foreground">
            Gestiona alertas y notificaciones del sistema
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar todo como leído
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Resumen de notificaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{actionRequiredCount}</p>
                <p className="text-sm text-muted-foreground">Requieren acción</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <BellOff className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Sin leer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total notificaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de notificaciones */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones
            </CardTitle>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="unread">
                  Sin leer
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="action_required">
                  Acción requerida
                  {actionRequiredCount > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {actionRequiredCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay notificaciones que mostrar</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      notification.read 
                        ? 'bg-background border-border' 
                        : `${getPriorityBgColor(notification.priority)} border-l-4`
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        notification.priority === 'high' ? 'bg-destructive/10' :
                        notification.priority === 'medium' ? 'bg-primary/10' :
                        'bg-secondary/10'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${
                                notification.read ? 'text-muted-foreground' : 'text-foreground'
                              }`}>
                                {notification.title}
                              </h3>
                              <Badge 
                                variant={getPriorityColor(notification.priority) as any}
                                className="text-xs"
                              >
                                {notification.priority === 'high' ? 'Alta' :
                                 notification.priority === 'medium' ? 'Media' : 'Baja'}
                              </Badge>
                              {notification.actionRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  Acción requerida
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              {notification.entityType && (
                                <span className="capitalize">
                                  {notification.entityType === 'franchisee' ? 'Franquiciado' :
                                   notification.entityType === 'restaurant' ? 'Restaurante' :
                                   notification.entityType}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dismissNotification(notification.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {notification.actionRequired && (
                          <div className="mt-3 flex items-center gap-2">
                            <Button size="sm" className="h-8">
                              Ver detalles
                            </Button>
                            <Button size="sm" variant="outline" className="h-8">
                              Marcar como resuelto
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
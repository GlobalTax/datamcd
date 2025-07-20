
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Calendar, 
  AlertTriangle, 
  Gift, 
  Clock,
  FileText,
  X 
} from 'lucide-react';

interface HRNotification {
  id: string;
  type: 'contract_expiring' | 'birthday' | 'anniversary' | 'vacation_pending' | 'overtime_alert';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
  employeeName?: string;
  actionRequired?: boolean;
}

interface HRNotificationsProps {
  notifications: HRNotification[];
  onDismiss?: (notificationId: string) => void;
  onViewAll?: () => void;
}

export const HRNotifications: React.FC<HRNotificationsProps> = ({
  notifications,
  onDismiss,
  onViewAll
}) => {
  const getNotificationIcon = (type: HRNotification['type']) => {
    switch (type) {
      case 'contract_expiring':
        return <FileText className="h-4 w-4" />;
      case 'birthday':
        return <Gift className="h-4 w-4" />;
      case 'anniversary':
        return <Calendar className="h-4 w-4" />;
      case 'vacation_pending':
        return <Calendar className="h-4 w-4" />;
      case 'overtime_alert':
        return <Clock className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: HRNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const urgentNotifications = notifications.filter(n => n.priority === 'high');
  const otherNotifications = notifications.filter(n => n.priority !== 'high');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones RRHH
            {urgentNotifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {urgentNotifications.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Alertas y recordatorios importantes del personal
          </CardDescription>
        </div>
        {notifications.length > 3 && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Ver Todas
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {/* Notificaciones urgentes primero */}
            {urgentNotifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`relative p-3 rounded-lg border ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-xs">
                            Acción Requerida
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm opacity-90">{notification.message}</p>
                      {notification.employeeName && (
                        <p className="text-xs font-medium mt-1">
                          Empleado: {notification.employeeName}
                        </p>
                      )}
                      <p className="text-xs opacity-75 mt-1">{notification.date}</p>
                    </div>
                  </div>
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(notification.id)}
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Otras notificaciones */}
            {otherNotifications.slice(0, 2).map((notification) => (
              <div
                key={notification.id}
                className={`relative p-3 rounded-lg border ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-white">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                      </div>
                      <p className="text-sm opacity-90">{notification.message}</p>
                      {notification.employeeName && (
                        <p className="text-xs font-medium mt-1">
                          Empleado: {notification.employeeName}
                        </p>
                      )}
                      <p className="text-xs opacity-75 mt-1">{notification.date}</p>
                    </div>
                  </div>
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(notification.id)}
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay notificaciones pendientes</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

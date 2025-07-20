
import { useState, useEffect, useMemo } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeOff } from '@/hooks/useTimeOff';
import { supabase } from '@/integrations/supabase/client';

export interface AdvancedHRNotification {
  id: string;
  type: 'contract_expiring' | 'birthday' | 'anniversary' | 'vacation_pending' | 'overtime_alert' | 
        'attendance_irregular' | 'document_expiring' | 'high_turnover' | 'sync_failure' | 
        'performance_review' | 'training_overdue' | 'legal_compliance';
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'hr' | 'legal' | 'system' | 'operational';
  date: string;
  employeeName?: string;
  employeeId?: string;
  restaurantId?: string;
  actionRequired: boolean;
  dueDate?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  canDismiss: boolean;
}

export interface NotificationSettings {
  enableOvertimeAlerts: boolean;
  overtimeThreshold: number; // hours per week
  contractExpiryWarningDays: number;
  attendanceAlertDays: number;
  enableEmailNotifications: boolean;
  enableSystemAlerts: boolean;
  criticalAlertsOnly: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enableOvertimeAlerts: true,
  overtimeThreshold: 40,
  contractExpiryWarningDays: 30,
  attendanceAlertDays: 3,
  enableEmailNotifications: false,
  enableSystemAlerts: true,
  criticalAlertsOnly: false
};

export const useAdvancedHRNotifications = (franchiseeId?: string) => {
  const { employees } = useEmployees();
  const { timeOffRequests } = useTimeOff();
  const [notifications, setNotifications] = useState<AdvancedHRNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Cargar configuración de notificaciones
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('integration_configs')
          .select('configuration')
          .eq('integration_type', 'hr_notifications')
          .eq('franchisee_id', franchiseeId)
          .single();

        if (data && !error && data.configuration && typeof data.configuration === 'object') {
          setSettings({ ...DEFAULT_SETTINGS, ...data.configuration });
        }
      } catch (error) {
        console.log('No notification settings found, using defaults');
      }
    };

    if (franchiseeId) {
      loadSettings();
    }
  }, [franchiseeId]);

  const generateAdvancedNotifications = useMemo(() => {
    const newNotifications: AdvancedHRNotification[] = [];
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // 1. Contratos próximos a vencer (mejorado)
    employees.forEach(employee => {
      if (employee.contract_end_date) {
        const endDate = new Date(employee.contract_end_date);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= settings.contractExpiryWarningDays && daysUntilExpiry > 0) {
          newNotifications.push({
            id: `contract_${employee.id}`,
            type: 'contract_expiring',
            title: 'Contrato próximo a vencer',
            message: `El contrato de ${employee.first_name} ${employee.last_name} vence en ${daysUntilExpiry} días`,
            priority: daysUntilExpiry <= 7 ? 'critical' : daysUntilExpiry <= 15 ? 'high' : 'medium',
            category: 'legal',
            date: new Date().toISOString(),
            employeeName: `${employee.first_name} ${employee.last_name}`,
            employeeId: employee.id,
            actionRequired: true,
            dueDate: employee.contract_end_date,
            isRead: false,
            canDismiss: false,
            metadata: { contractType: employee.contract_type }
          });
        }
      }
    });

    // 2. Alertas de horas extras
    if (settings.enableOvertimeAlerts) {
      employees.forEach(employee => {
        if (employee.weekly_hours && employee.weekly_hours > settings.overtimeThreshold) {
          const overtimeHours = employee.weekly_hours - settings.overtimeThreshold;
          newNotifications.push({
            id: `overtime_${employee.id}`,
            type: 'overtime_alert',
            title: 'Alerta de horas extras',
            message: `${employee.first_name} ${employee.last_name} tiene ${overtimeHours}h extras esta semana`,
            priority: overtimeHours > 10 ? 'high' : 'medium',
            category: 'legal',
            date: new Date().toISOString(),
            employeeName: `${employee.first_name} ${employee.last_name}`,
            employeeId: employee.id,
            actionRequired: true,
            isRead: false,
            canDismiss: true,
            metadata: { overtimeHours, weeklyHours: employee.weekly_hours }
          });
        }
      });
    }

    // 3. Asistencia irregular (simulado por ahora)
    employees.forEach(employee => {
      if (Math.random() > 0.95) { // 5% probabilidad para demo
        newNotifications.push({
          id: `attendance_${employee.id}`,
          type: 'attendance_irregular',
          title: 'Asistencia irregular detectada',
          message: `${employee.first_name} ${employee.last_name} ha faltado ${settings.attendanceAlertDays} días esta semana`,
          priority: 'medium',
          category: 'operational',
          date: new Date().toISOString(),
          employeeName: `${employee.first_name} ${employee.last_name}`,
          employeeId: employee.id,
          actionRequired: true,
          isRead: false,
          canDismiss: true,
          metadata: { absentDays: settings.attendanceAlertDays }
        });
      }
    });

    // 4. Documentos próximos a vencer
    employees.forEach(employee => {
      if (Math.random() > 0.92) { // 8% probabilidad para demo
        newNotifications.push({
          id: `document_${employee.id}`,
          type: 'document_expiring',
          title: 'Documento próximo a vencer',
          message: `El certificado médico de ${employee.first_name} ${employee.last_name} vence pronto`,
          priority: 'high',
          category: 'legal',
          date: new Date().toISOString(),
          employeeName: `${employee.first_name} ${employee.last_name}`,
          employeeId: employee.id,
          actionRequired: true,
          isRead: false,
          canDismiss: false,
          metadata: { documentType: 'certificado_medico' }
        });
      }
    });

    // 5. Vacaciones pendientes (mejorado)
    const pendingVacations = timeOffRequests.filter(req => req.status === 'pending');
    pendingVacations.forEach((request) => {
      const daysSinceRequest = Math.ceil((today.getTime() - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      newNotifications.push({
        id: `vacation_${request.id}`,
        type: 'vacation_pending',
        title: 'Solicitud de vacaciones pendiente',
        message: `Solicitud de ${request.days_requested} días lleva ${daysSinceRequest} días sin respuesta`,
        priority: daysSinceRequest > 7 ? 'high' : 'medium',
        category: 'hr',
        date: new Date(request.created_at).toISOString(),
        actionRequired: true,
        isRead: false,
        canDismiss: false,
        metadata: { 
          requestId: request.id,
          daysSinceRequest,
          daysRequested: request.days_requested,
          requestType: request.type
        }
      });
    });

    // 6. Alertas de sistema (simuladas)
    if (settings.enableSystemAlerts && Math.random() > 0.85) {
      newNotifications.push({
        id: `sync_failure_${Date.now()}`,
        type: 'sync_failure',
        title: 'Error de sincronización con Orquest',
        message: 'La última sincronización con Orquest falló. Revisar configuración.',
        priority: 'high',
        category: 'system',
        date: new Date().toISOString(),
        actionRequired: true,
        isRead: false,
        canDismiss: false,
        metadata: { systemType: 'orquest', lastSync: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString() }
      });
    }

    // 7. Evaluaciones de desempeño pendientes
    employees.forEach(employee => {
      const hireDate = new Date(employee.hire_date);
      const monthsSinceHire = (today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsSinceHire >= 6 && Math.random() > 0.88) { // 12% probabilidad para empleados con más de 6 meses
        newNotifications.push({
          id: `performance_${employee.id}`,
          type: 'performance_review',
          title: 'Evaluación de desempeño pendiente',
          message: `${employee.first_name} ${employee.last_name} necesita evaluación de desempeño`,
          priority: 'medium',
          category: 'hr',
          date: new Date().toISOString(),
          employeeName: `${employee.first_name} ${employee.last_name}`,
          employeeId: employee.id,
          actionRequired: true,
          isRead: false,
          canDismiss: true,
          metadata: { monthsSinceHire: Math.floor(monthsSinceHire) }
        });
      }
    });

    // 8. Rotación alta por departamento
    const departmentStats = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Sin departamento';
      if (!acc[dept]) acc[dept] = { total: 0, terminated: 0 };
      acc[dept].total++;
      if (emp.status === 'terminated') acc[dept].terminated++;
      return acc;
    }, {} as Record<string, { total: number; terminated: number }>);

    Object.entries(departmentStats).forEach(([dept, stats]) => {
      const turnoverRate = stats.total > 0 ? (stats.terminated / stats.total) * 100 : 0;
      if (turnoverRate > 20) { // Más del 20% de rotación
        newNotifications.push({
          id: `turnover_${dept}`,
          type: 'high_turnover',
          title: 'Alta rotación detectada',
          message: `El departamento ${dept} tiene una rotación del ${turnoverRate.toFixed(1)}%`,
          priority: turnoverRate > 40 ? 'high' : 'medium',
          category: 'operational',
          date: new Date().toISOString(),
          actionRequired: true,
          isRead: false,
          canDismiss: true,
          metadata: { department: dept, turnoverRate, totalEmployees: stats.total }
        });
      }
    });

    // Filtrar por configuración si solo se quieren alertas críticas
    const filteredNotifications = settings.criticalAlertsOnly 
      ? newNotifications.filter(n => n.priority === 'critical')
      : newNotifications;

    // Ordenar por prioridad y fecha
    return filteredNotifications.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [employees, timeOffRequests, settings]);

  useEffect(() => {
    if (employees.length > 0) {
      setNotifications(generateAdvancedNotifications);
      setLoading(false);
    }
  }, [generateAdvancedNotifications, employees]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId || !n.canDismiss));
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Guardar en base de datos
    if (franchiseeId) {
      try {
        await supabase
          .from('integration_configs')
          .upsert({
            advisor_id: '00000000-0000-0000-0000-000000000000', // UUID nulo para configuraciones de franquiciado
            franchisee_id: franchiseeId,
            integration_type: 'hr_notifications',
            config_name: 'notification_settings',
            configuration: updatedSettings,
            is_active: true
          });
      } catch (error) {
        console.error('Error saving notification settings:', error);
      }
    }
  };

  const getNotificationsByCategory = (category: string) => {
    return notifications.filter(n => n.category === category);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  const getCriticalCount = () => {
    return notifications.filter(n => n.priority === 'critical').length;
  };

  return {
    notifications,
    settings,
    loading,
    markAsRead,
    dismissNotification,
    updateSettings,
    getNotificationsByCategory,
    unreadCount: getUnreadCount(),
    criticalCount: getCriticalCount(),
    categories: {
      hr: getNotificationsByCategory('hr'),
      legal: getNotificationsByCategory('legal'),
      system: getNotificationsByCategory('system'),
      operational: getNotificationsByCategory('operational')
    }
  };
};

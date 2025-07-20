
import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeOff } from '@/hooks/useTimeOff';

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

export const useHRNotifications = () => {
  const { employees } = useEmployees();
  const { timeOffRequests } = useTimeOff();
  const [notifications, setNotifications] = useState<HRNotification[]>([]);

  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: HRNotification[] = [];
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Contratos próximos a vencer (versión simplificada para compatibilidad)
      employees.forEach(employee => {
        if (employee.contract_end_date) {
          const endDate = new Date(employee.contract_end_date);
          if (endDate <= nextMonth && endDate > today) {
            const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            newNotifications.push({
              id: `contract_${employee.id}`,
              type: 'contract_expiring',
              title: 'Contrato próximo a vencer',
              message: `El contrato de ${employee.first_name} ${employee.last_name} vence en ${daysUntilExpiry} días`,
              priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
              date: new Date().toLocaleDateString(),
              employeeName: `${employee.first_name} ${employee.last_name}`,
              actionRequired: true
            });
          }
        }
      });

      // Cumpleaños próximos (solo si tenemos fecha de nacimiento en el futuro)
      employees.forEach(employee => {
        // Por ahora simulamos algunos cumpleaños
        if (Math.random() > 0.9) { // 10% de probabilidad para demo
          newNotifications.push({
            id: `birthday_${employee.id}`,
            type: 'birthday',
            title: 'Cumpleaños próximo',
            message: `${employee.first_name} ${employee.last_name} cumple años esta semana`,
            priority: 'low',
            date: new Date().toLocaleDateString(),
            employeeName: `${employee.first_name} ${employee.last_name}`,
            actionRequired: false
          });
        }
      });

      // Aniversarios laborales
      employees.forEach(employee => {
        const hireDate = new Date(employee.hire_date);
        const anniversaryThisYear = new Date(today.getFullYear(), hireDate.getMonth(), hireDate.getDate());
        
        if (anniversaryThisYear <= nextWeek && anniversaryThisYear >= today) {
          const yearsWorked = today.getFullYear() - hireDate.getFullYear();
          newNotifications.push({
            id: `anniversary_${employee.id}`,
            type: 'anniversary',
            title: 'Aniversario laboral',
            message: `${employee.first_name} ${employee.last_name} cumple ${yearsWorked} años en la empresa`,
            priority: 'medium',
            date: new Date().toLocaleDateString(),
            employeeName: `${employee.first_name} ${employee.last_name}`,
            actionRequired: false
          });
        }
      });

      // Solicitudes de vacaciones pendientes
      const pendingVacations = timeOffRequests.filter(req => req.status === 'pending');
      pendingVacations.forEach((request, index) => {
        newNotifications.push({
          id: `vacation_${request.id}`,
          type: 'vacation_pending',
          title: 'Solicitud de vacaciones pendiente',
          message: `Solicitud de ${request.days_requested} días pendiente de aprobación`,
          priority: 'high',
          date: new Date(request.created_at).toLocaleDateString(),
          employeeName: 'Empleado', // Aquí necesitaríamos hacer join con employees
          actionRequired: true
        });
      });

      // Agregar algunas notificaciones de ejemplo de horas extras
      employees.forEach(employee => {
        if (employee.weekly_hours && employee.weekly_hours > 40 && Math.random() > 0.85) {
          const overtimeHours = employee.weekly_hours - 40;
          newNotifications.push({
            id: `overtime_${employee.id}`,
            type: 'overtime_alert',
            title: 'Alerta de horas extras',
            message: `${employee.first_name} ${employee.last_name} tiene ${overtimeHours}h extras esta semana`,
            priority: 'high',
            date: new Date().toLocaleDateString(),
            employeeName: `${employee.first_name} ${employee.last_name}`,
            actionRequired: true
          });
        }
      });

      setNotifications(newNotifications.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }));
    };

    if (employees.length > 0) {
      generateNotifications();
    }
  }, [employees, timeOffRequests]);

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return {
    notifications,
    dismissNotification,
    urgentCount: notifications.filter(n => n.priority === 'high').length
  };
};

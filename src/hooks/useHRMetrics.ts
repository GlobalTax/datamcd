
import { useState, useEffect, useMemo } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useWorkersPanel } from '@/hooks/useWorkersPanel';
import { useTimeOff } from '@/hooks/useTimeOff';
import { usePayroll } from '@/hooks/usePayroll';

interface HRMetrics {
  totalEmployees: number;
  activeEmployees: number;
  monthlyHours: number;
  pendingVacations: number;
  contractsExpiring: number;
  monthlyCost: number;
  averageSalary: number;
  employeeTurnover: number;
}

export const useHRMetrics = (franchiseeId?: string) => {
  const { employees, loading: employeesLoading, stats } = useEmployees();
  const { workers, loading: workersLoading } = useWorkersPanel(franchiseeId);
  const { timeOffRequests, loading: timeOffLoading } = useTimeOff();
  const { payrollRecords, loading: payrollLoading } = usePayroll();
  
  const [loading, setLoading] = useState(true);

  const metrics = useMemo((): HRMetrics => {
    // Calcular empleados activos
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;

    // Calcular horas mensuales estimadas
    const monthlyHours = employees.reduce((total, emp) => {
      const weeklyHours = emp.weekly_hours || 40;
      return total + (weeklyHours * 4.33); // Promedio semanas por mes
    }, 0);

    // Calcular vacaciones pendientes
    const pendingVacations = timeOffRequests.filter(req => req.status === 'pending').length;

    // Calcular contratos próximos a vencer (próximos 3 meses)
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    const contractsExpiring = employees.filter(emp => {
      if (!emp.contract_end_date) return false;
      const endDate = new Date(emp.contract_end_date);
      return endDate <= threeMonthsFromNow && endDate > new Date();
    }).length;

    // Calcular costos mensuales
    const monthlyCost = employees
      .filter(emp => emp.status === 'active')
      .reduce((total, emp) => {
        if (emp.salary_frequency === 'mensual' && emp.base_salary) {
          return total + emp.base_salary;
        } else if (emp.hourly_rate && emp.weekly_hours) {
          return total + (emp.hourly_rate * emp.weekly_hours * 4.33);
        }
        return total;
      }, 0);

    const averageSalary = activeEmployees > 0 ? monthlyCost / activeEmployees : 0;

    // Calcular rotación de empleados (simplificado - últimos 12 meses)
    const currentYear = new Date().getFullYear();
    const terminatedThisYear = employees.filter(emp => {
      if (!emp.termination_date) return false;
      const termDate = new Date(emp.termination_date);
      return termDate.getFullYear() === currentYear;
    }).length;

    const employeeTurnover = totalEmployees > 0 ? (terminatedThisYear / totalEmployees) * 100 : 0;

    return {
      totalEmployees,
      activeEmployees,
      monthlyHours: Math.round(monthlyHours),
      pendingVacations,
      contractsExpiring,
      monthlyCost: Math.round(monthlyCost),
      averageSalary: Math.round(averageSalary),
      employeeTurnover: Math.round(employeeTurnover * 10) / 10 // 1 decimal
    };
  }, [employees, timeOffRequests]);

  useEffect(() => {
    const allLoading = employeesLoading || workersLoading || timeOffLoading || payrollLoading;
    setLoading(allLoading);
  }, [employeesLoading, workersLoading, timeOffLoading, payrollLoading]);

  return {
    metrics,
    loading,
    rawData: {
      employees,
      workers,
      timeOffRequests,
      payrollRecords,
      stats
    }
  };
};

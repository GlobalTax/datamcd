import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Employee, 
  EmployeeFormData, 
  EmployeeStats,
  EmployeePayroll,
  EmployeeTimeTracking,
  EmployeeTimeOff 
} from '@/types/employee';
import { EmployeeServiceAPI } from '@/services/api/employeeService';

interface EmployeesConfig {
  restaurantId?: string;
  includePayroll?: boolean;
  includeTimeTracking?: boolean;
  includeTimeOff?: boolean;
  autoFetch?: boolean;
}

export const useEmployees = (config?: EmployeesConfig) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [payrollRecords, setPayrollRecords] = useState<EmployeePayroll[]>([]);
  const [timeRecords, setTimeRecords] = useState<EmployeeTimeTracking[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<EmployeeTimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    restaurantId,
    includePayroll = false,
    includeTimeTracking = false,
    includeTimeOff = false,
    autoFetch = true
  } = config || {};

  // ============= EMPLEADOS =============
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await EmployeeServiceAPI.fetchEmployees(restaurantId);
      setEmployees(data);
      
      const statsData = await EmployeeServiceAPI.calculateStats(data);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar empleados';
      setError(errorMessage);
      console.error('Error fetching employees:', err);
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: EmployeeFormData, restaurantId: string): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.createEmployee(employeeData, restaurantId);
      
      toast.success('Empleado creado exitosamente');
      await fetchEmployees();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear empleado';
      console.error('Error creating employee:', err);
      toast.error('Error al crear empleado: ' + errorMessage);
      return false;
    }
  };

  const updateEmployee = async (employeeId: string, employeeData: Partial<EmployeeFormData>): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.updateEmployee(employeeId, employeeData);
      
      toast.success('Empleado actualizado exitosamente');
      await fetchEmployees();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar empleado';
      console.error('Error updating employee:', err);
      toast.error('Error al actualizar empleado: ' + errorMessage);
      return false;
    }
  };

  const deleteEmployee = async (employeeId: string): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.deleteEmployee(employeeId);
      
      toast.success('Empleado eliminado exitosamente');
      await fetchEmployees();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar empleado';
      console.error('Error deleting employee:', err);
      toast.error('Error al eliminar empleado: ' + errorMessage);
      return false;
    }
  };

  // ============= NÓMINAS =============
  const fetchPayrollRecords = async (period?: string) => {
    if (!includePayroll) return;
    
    try {
      setLoading(true);
      
      const data = await EmployeeServiceAPI.fetchPayrollRecords(restaurantId, period);
      setPayrollRecords(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar nóminas';
      console.error('Error fetching payroll records:', err);
      toast.error('Error al cargar registros de nómina');
    } finally {
      setLoading(false);
    }
  };

  const generatePayroll = async (employeeId: string, periodStart: string, periodEnd: string): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.generatePayroll(employeeId, periodStart, periodEnd);
      
      toast.success('Nómina generada exitosamente');
      await fetchPayrollRecords();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar nómina';
      console.error('Error generating payroll:', err);
      toast.error('Error al generar nómina: ' + errorMessage);
      return false;
    }
  };

  const updatePayrollStatus = async (payrollId: string, status: 'draft' | 'approved' | 'paid'): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.updatePayrollStatus(payrollId, status);
      
      toast.success('Estado de nómina actualizado');
      await fetchPayrollRecords();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar estado de nómina';
      console.error('Error updating payroll status:', err);
      toast.error('Error al actualizar estado de nómina');
      return false;
    }
  };

  // ============= SEGUIMIENTO DE TIEMPO =============
  const fetchTimeRecords = async (date?: string, employeeId?: string) => {
    if (!includeTimeTracking) return;
    
    try {
      setLoading(true);
      
      const data = await EmployeeServiceAPI.fetchTimeRecords(restaurantId, date, employeeId);
      setTimeRecords(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar registros de horarios';
      console.error('Error fetching time records:', err);
      toast.error('Error al cargar registros de horarios');
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async (employeeId: string): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.clockIn(employeeId);
      
      toast.success('Entrada registrada exitosamente');
      await fetchTimeRecords();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar entrada';
      console.error('Error clocking in:', err);
      toast.error(errorMessage);
      return false;
    }
  };

  const clockOut = async (employeeId: string): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.clockOut(employeeId);
      
      toast.success('Salida registrada exitosamente');
      await fetchTimeRecords();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar salida';
      console.error('Error clocking out:', err);
      toast.error(errorMessage);
      return false;
    }
  };

  const updateTimeRecord = async (recordId: string, updates: Partial<EmployeeTimeTracking>): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.updateTimeRecord(recordId, updates);
      
      toast.success('Registro actualizado exitosamente');
      await fetchTimeRecords();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar registro';
      console.error('Error updating time record:', err);
      toast.error('Error al actualizar registro');
      return false;
    }
  };

  // ============= AUSENCIAS =============
  const fetchTimeOffRequests = async () => {
    if (!includeTimeOff) return;
    
    try {
      setLoading(true);
      
      const data = await EmployeeServiceAPI.fetchTimeOffRequests(restaurantId);
      setTimeOffRequests(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar solicitudes de vacaciones';
      console.error('Error fetching time off requests:', err);
      toast.error('Error al cargar solicitudes de vacaciones');
    } finally {
      setLoading(false);
    }
  };

  const requestTimeOff = async (request: Omit<EmployeeTimeOff, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.createTimeOffRequest(request);
      
      toast.success('Solicitud creada exitosamente');
      await fetchTimeOffRequests();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear solicitud';
      console.error('Error creating time off request:', err);
      toast.error('Error al crear solicitud: ' + errorMessage);
      return false;
    }
  };

  const updateTimeOffRequest = async (requestId: string, updates: Partial<EmployeeTimeOff>): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.updateTimeOffRequest(requestId, updates);
      
      toast.success('Solicitud actualizada exitosamente');
      await fetchTimeOffRequests();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar solicitud';
      console.error('Error updating time off request:', err);
      toast.error('Error al actualizar solicitud: ' + errorMessage);
      return false;
    }
  };

  const approveTimeOff = async (requestId: string, userId: string): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.approveTimeOffRequest(requestId, userId);
      
      toast.success('Solicitud aprobada exitosamente');
      await fetchTimeOffRequests();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar solicitud';
      console.error('Error approving time off request:', err);
      toast.error('Error al aprobar solicitud: ' + errorMessage);
      return false;
    }
  };

  const rejectTimeOff = async (requestId: string, userId: string): Promise<boolean> => {
    try {
      await EmployeeServiceAPI.rejectTimeOffRequest(requestId, userId);
      
      toast.success('Solicitud rechazada');
      await fetchTimeOffRequests();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al rechazar solicitud';
      console.error('Error rejecting time off request:', err);
      toast.error('Error al rechazar solicitud: ' + errorMessage);
      return false;
    }
  };

  // ============= UTILIDADES =============
  const getEmployeesByStatus = (status: Employee['status']) => 
    EmployeeServiceAPI.getEmployeesByStatus(employees, status);

  const getEmployeesByDepartment = (department: string) => 
    EmployeeServiceAPI.getEmployeesByDepartment(employees, department);

  const getActiveEmployees = () => 
    EmployeeServiceAPI.getActiveEmployees(employees);

  const getPendingTimeOffRequests = () => 
    EmployeeServiceAPI.getPendingTimeOffRequests(timeOffRequests);

  const getTodayTimeRecords = () => 
    EmployeeServiceAPI.getTodayTimeRecords(timeRecords);

  const getCurrentMonthPayroll = () => 
    EmployeeServiceAPI.getCurrentMonthPayroll(payrollRecords);

  // ============= EFFECTS =============
  useEffect(() => {
    if (autoFetch) {
      fetchEmployees();
      
      if (includePayroll) {
        fetchPayrollRecords();
      }
      if (includeTimeTracking) {
        fetchTimeRecords();
      }
      if (includeTimeOff) {
        fetchTimeOffRequests();
      }
    }
  }, [restaurantId, includePayroll, includeTimeTracking, includeTimeOff, autoFetch]);

  return {
    // Estado
    employees,
    stats,
    payrollRecords,
    timeRecords,
    timeOffRequests,
    loading,
    error,

    // CRUD empleados
    createEmployee,
    updateEmployee,
    deleteEmployee,
    
    // Gestión de nóminas
    generatePayroll,
    updatePayrollStatus,
    fetchPayrollRecords,
    
    // Seguimiento de tiempo
    clockIn,
    clockOut,
    updateTimeRecord,
    fetchTimeRecords,
    
    // Gestión de ausencias
    requestTimeOff,
    approveTimeOff,
    rejectTimeOff,
    updateTimeOffRequest,
    fetchTimeOffRequests,
    
    // Utilidades
    getEmployeesByStatus,
    getEmployeesByDepartment,
    getActiveEmployees,
    getPendingTimeOffRequests,
    getTodayTimeRecords,
    getCurrentMonthPayroll,
    
    // Refetch general
    refetch: () => {
      fetchEmployees();
      if (includePayroll) fetchPayrollRecords();
      if (includeTimeTracking) fetchTimeRecords();
      if (includeTimeOff) fetchTimeOffRequests();
    }
  };
};
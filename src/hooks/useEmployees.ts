import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee, EmployeeFormData, EmployeeStats } from '@/types/employee';
import { toast } from 'sonner';

export const useEmployees = (restaurantId?: string) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmployeeStats | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('employees')
        .select('*')
        .order('last_name', { ascending: true });

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching employees:', error);
        toast.error('Error al cargar empleados');
        return;
      }

      setEmployees((data || []) as Employee[]);
      await calculateStats((data || []) as Employee[]);
    } catch (error) {
      console.error('Error in fetchEmployees:', error);
      toast.error('Error inesperado al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (employeeData: Employee[]) => {
    const totalEmployees = employeeData.length;
    const activeEmployees = employeeData.filter(emp => emp.status === 'active').length;
    const inactiveEmployees = totalEmployees - activeEmployees;
    
    const totalPayroll = employeeData
      .filter(emp => emp.status === 'active' && emp.base_salary)
      .reduce((sum, emp) => sum + (emp.base_salary || 0), 0);
    
    const averageSalary = activeEmployees > 0 ? totalPayroll / activeEmployees : 0;

    // Fetch pending time off requests
    const { data: timeOffData } = await supabase
      .from('employee_time_off')
      .select('id')
      .eq('status', 'pending')
      .in('employee_id', employeeData.map(emp => emp.id));

    setStats({
      total_employees: totalEmployees,
      active_employees: activeEmployees,
      inactive_employees: inactiveEmployees,
      total_payroll: totalPayroll,
      average_salary: averageSalary,
      total_overtime_hours: 0, // TODO: Calculate from time tracking
      pending_time_off_requests: timeOffData?.length || 0
    });
  };

  const createEmployee = async (employeeData: EmployeeFormData, restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...employeeData,
          restaurant_id: restaurantId,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        toast.error('Error al crear empleado: ' + error.message);
        return false;
      }

      toast.success('Empleado creado exitosamente');
      await fetchEmployees();
      return true;
    } catch (error) {
      console.error('Error in createEmployee:', error);
      toast.error('Error inesperado al crear empleado');
      return false;
    }
  };

  const updateEmployee = async (employeeId: string, employeeData: Partial<EmployeeFormData>) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          ...employeeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (error) {
        console.error('Error updating employee:', error);
        toast.error('Error al actualizar empleado: ' + error.message);
        return false;
      }

      toast.success('Empleado actualizado exitosamente');
      await fetchEmployees();
      return true;
    } catch (error) {
      console.error('Error in updateEmployee:', error);
      toast.error('Error inesperado al actualizar empleado');
      return false;
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) {
        console.error('Error deleting employee:', error);
        toast.error('Error al eliminar empleado: ' + error.message);
        return false;
      }

      toast.success('Empleado eliminado exitosamente');
      await fetchEmployees();
      return true;
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      toast.error('Error inesperado al eliminar empleado');
      return false;
    }
  };

  const getEmployeesByStatus = (status: Employee['status']) => {
    return employees.filter(emp => emp.status === status);
  };

  const getEmployeesByDepartment = (department: string) => {
    return employees.filter(emp => emp.department === department);
  };

  useEffect(() => {
    fetchEmployees();
  }, [restaurantId]);

  return {
    employees,
    loading,
    stats,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
    getEmployeesByStatus,
    getEmployeesByDepartment
  };
};
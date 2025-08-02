import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  status: string;
  hire_date: string;
  base_salary: number;
  hourly_rate: number;
  email: string;
  phone: string;
}

interface PersonnelMetrics {
  activeEmployees: number;
  totalEmployees: number;
  totalPayroll: number;
  totalHours: number;
  pendingRequests: number;
  departmentDistribution: Array<{ department: string; count: number }>;
}

export const useRestaurantPersonnel = (restaurantId: string) => {
  const [personnel, setPersonnel] = useState<Employee[]>([]);
  const [metrics, setMetrics] = useState<PersonnelMetrics>({
    activeEmployees: 0,
    totalEmployees: 0,
    totalPayroll: 0,
    totalHours: 0,
    pendingRequests: 0,
    departmentDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchPersonnelData = async () => {
      try {
        setLoading(true);

        // Fetch employees
        const { data: employeesData } = await supabase
          .from('employees')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('hire_date', { ascending: false });

        setPersonnel(employeesData || []);

        if (employeesData) {
          // Calculate metrics
          const activeEmployees = employeesData.filter(e => e.status === 'active').length;
          const totalEmployees = employeesData.length;

          // Get current month payroll
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();

          const { data: payrollData } = await supabase
            .from('employee_payroll')
            .select('gross_pay')
            .in('employee_id', employeesData.map(e => e.id))
            .gte('period_start', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
            .lt('period_start', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

          const totalPayroll = payrollData?.reduce((sum, p) => sum + (p.gross_pay || 0), 0) || 0;

          // Get time tracking for current month
          const { data: timeData } = await supabase
            .from('employee_time_tracking')
            .select('total_hours')
            .in('employee_id', employeesData.map(e => e.id))
            .gte('date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
            .lt('date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

          const totalHours = timeData?.reduce((sum, t) => sum + (t.total_hours || 0), 0) || 0;

          // Get pending time-off requests
          const { data: timeOffData } = await supabase
            .from('employee_time_off')
            .select('id')
            .in('employee_id', employeesData.map(e => e.id))
            .eq('status', 'pending');

          const pendingRequests = timeOffData?.length || 0;

          // Department distribution
          const deptGroups = employeesData.reduce((acc, employee) => {
            const dept = employee.department || 'Sin departamento';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const departmentDistribution = Object.entries(deptGroups).map(([department, count]) => ({
            department,
            count,
          }));

          setMetrics({
            activeEmployees,
            totalEmployees,
            totalPayroll,
            totalHours,
            pendingRequests,
            departmentDistribution,
          });
        }

      } catch (error) {
        console.error('Error fetching personnel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonnelData();
  }, [restaurantId]);

  return { personnel, metrics, loading };
};
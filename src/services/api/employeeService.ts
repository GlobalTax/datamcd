import { supabase } from '@/integrations/supabase/client';
import { 
  Employee, 
  EmployeeFormData, 
  EmployeeStats,
  EmployeePayroll,
  EmployeeTimeTracking,
  EmployeeTimeOff 
} from '@/types/employee';

export class EmployeeServiceAPI {
  // ============= EMPLEADOS =============
  static async fetchEmployees(restaurantId?: string): Promise<Employee[]> {
    let query = supabase
      .from('employees')
      .select('*')
      .order('last_name', { ascending: true });

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Employee[];
  }

  static async createEmployee(employeeData: EmployeeFormData, restaurantId: string): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        ...employeeData,
        restaurant_id: restaurantId,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data as Employee;
  }

  static async updateEmployee(employeeId: string, employeeData: Partial<EmployeeFormData>): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({
        ...employeeData,
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (error) throw error;
  }

  static async deleteEmployee(employeeId: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (error) throw error;
  }

  static async calculateStats(employeeData: Employee[]): Promise<EmployeeStats> {
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

    return {
      total_employees: totalEmployees,
      active_employees: activeEmployees,
      inactive_employees: inactiveEmployees,
      total_payroll: totalPayroll,
      average_salary: averageSalary,
      total_overtime_hours: 0, // TODO: Calculate from time tracking
      pending_time_off_requests: timeOffData?.length || 0
    };
  }

  // ============= NÓMINAS =============
  static async fetchPayrollRecords(restaurantId?: string, period?: string): Promise<EmployeePayroll[]> {
    let query = supabase
      .from('employee_payroll')
      .select(`
        *,
        employee:employees(*)
      `)
      .order('period_start', { ascending: false });

    if (period) {
      const year = period.split('-')[0];
      const month = period.split('-')[1];
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;
      
      query = query
        .gte('period_start', startDate)
        .lte('period_end', endDate);
    }

    if (restaurantId) {
      query = query.eq('employee.restaurant_id', restaurantId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as EmployeePayroll[];
  }

  static async generatePayroll(employeeId: string, periodStart: string, periodEnd: string): Promise<void> {
    // Get employee data
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (empError || !employee) {
      throw new Error('Error al obtener datos del empleado');
    }

    // Get time tracking data for the period
    const { data: timeData } = await supabase
      .from('employee_time_tracking')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', periodStart)
      .lte('date', periodEnd);

    // Calculate totals
    const regularHours = timeData?.reduce((sum, record) => sum + (record.total_hours || 0), 0) || 0;
    const overtimeHours = timeData?.reduce((sum, record) => sum + (record.overtime_hours || 0), 0) || 0;

    const basePay = employee.base_salary || 0;
    const overtimePay = (employee.hourly_rate || 10) * overtimeHours * 1.5;
    const grossPay = basePay + overtimePay;

    // Calculate deductions (simplified)
    const socialSecurity = grossPay * 0.0635; // 6.35%
    const incomeTax = grossPay * 0.15; // 15% simplified
    const netPay = grossPay - socialSecurity - incomeTax;

    const { error } = await supabase
      .from('employee_payroll')
      .insert({
        employee_id: employeeId,
        period_start: periodStart,
        period_end: periodEnd,
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
        base_pay: basePay,
        overtime_pay: overtimePay,
        bonuses: 0,
        commissions: 0,
        social_security: socialSecurity,
        income_tax: incomeTax,
        other_deductions: 0,
        gross_pay: grossPay,
        net_pay: netPay,
        status: 'draft'
      });

    if (error) throw error;
  }

  static async updatePayrollStatus(payrollId: string, status: 'draft' | 'approved' | 'paid'): Promise<void> {
    const updates: any = { status };
    if (status === 'paid') {
      updates.payment_date = new Date().toISOString().split('T')[0];
    }

    const { error } = await supabase
      .from('employee_payroll')
      .update(updates)
      .eq('id', payrollId);

    if (error) throw error;
  }

  // ============= SEGUIMIENTO DE TIEMPO =============
  static async fetchTimeRecords(restaurantId?: string, date?: string, employeeId?: string): Promise<EmployeeTimeTracking[]> {
    let query = supabase
      .from('employee_time_tracking')
      .select(`
        *,
        employee:employees(*)
      `)
      .order('date', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (restaurantId) {
      query = query.eq('employee.restaurant_id', restaurantId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as EmployeeTimeTracking[];
  }

  static async clockIn(employeeId: string): Promise<void> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check if already clocked in today
    const { data: existing } = await supabase
      .from('employee_time_tracking')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .is('clock_out', null)
      .single();

    if (existing) {
      throw new Error('El empleado ya tiene entrada registrada hoy');
    }

    const { error } = await supabase
      .from('employee_time_tracking')
      .insert({
        employee_id: employeeId,
        date: today,
        clock_in: now.toISOString()
      });

    if (error) throw error;
  }

  static async clockOut(employeeId: string): Promise<void> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Find today's clock in record
    const { data: existing } = await supabase
      .from('employee_time_tracking')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .is('clock_out', null)
      .single();

    if (!existing) {
      throw new Error('No se encontró entrada para hoy');
    }

    // Calculate total hours
    const clockInTime = new Date(existing.clock_in);
    const totalMinutes = (now.getTime() - clockInTime.getTime()) / (1000 * 60);
    const totalHours = totalMinutes / 60;
    const overtimeHours = Math.max(0, totalHours - 8);

    const { error } = await supabase
      .from('employee_time_tracking')
      .update({
        clock_out: now.toISOString(),
        total_hours: totalHours,
        overtime_hours: overtimeHours,
        status: 'pending'
      })
      .eq('id', existing.id);

    if (error) throw error;
  }

  static async updateTimeRecord(recordId: string, updates: Partial<EmployeeTimeTracking>): Promise<void> {
    const { error } = await supabase
      .from('employee_time_tracking')
      .update(updates)
      .eq('id', recordId);

    if (error) throw error;
  }

  // ============= AUSENCIAS =============
  static async fetchTimeOffRequests(restaurantId?: string): Promise<EmployeeTimeOff[]> {
    let query = supabase
      .from('employee_time_off')
      .select(`
        *,
        employee:employees(*),
        approved_by_profile:profiles!employee_time_off_approved_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (restaurantId) {
      query = query.eq('employee.restaurant_id', restaurantId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as EmployeeTimeOff[];
  }

  static async createTimeOffRequest(request: Omit<EmployeeTimeOff, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabase
      .from('employee_time_off')
      .insert(request);

    if (error) throw error;
  }

  static async updateTimeOffRequest(requestId: string, updates: Partial<EmployeeTimeOff>): Promise<void> {
    const { error } = await supabase
      .from('employee_time_off')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  }

  static async approveTimeOffRequest(requestId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('employee_time_off')
      .update({
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  }

  static async rejectTimeOffRequest(requestId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('employee_time_off')
      .update({
        status: 'rejected',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
  }

  // ============= UTILIDADES =============
  static getEmployeesByStatus(employees: Employee[], status: Employee['status']): Employee[] {
    return employees.filter(emp => emp.status === status);
  }

  static getEmployeesByDepartment(employees: Employee[], department: string): Employee[] {
    return employees.filter(emp => emp.department === department);
  }

  static getActiveEmployees(employees: Employee[]): Employee[] {
    return employees.filter(emp => emp.status === 'active');
  }

  static getPendingTimeOffRequests(timeOffRequests: EmployeeTimeOff[]): EmployeeTimeOff[] {
    return timeOffRequests.filter(req => req.status === 'pending');
  }

  static getTodayTimeRecords(timeRecords: EmployeeTimeTracking[]): EmployeeTimeTracking[] {
    const today = new Date().toISOString().split('T')[0];
    return timeRecords.filter(record => record.date === today);
  }

  static getCurrentMonthPayroll(payrollRecords: EmployeePayroll[]): EmployeePayroll[] {
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM
    
    return payrollRecords.filter(record => 
      record.period_start.startsWith(currentMonth)
    );
  }
}
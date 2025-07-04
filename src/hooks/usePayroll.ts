import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmployeePayroll } from '@/types/employee';
import { toast } from 'sonner';

export const usePayroll = (restaurantId?: string) => {
  const [payrollRecords, setPayrollRecords] = useState<EmployeePayroll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayrollRecords = async (period?: string) => {
    try {
      setLoading(true);
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

      if (error) {
        console.error('Error fetching payroll records:', error);
        toast.error('Error al cargar registros de nómina');
        return;
      }

      setPayrollRecords((data || []) as EmployeePayroll[]);
    } catch (error) {
      console.error('Error in fetchPayrollRecords:', error);
      toast.error('Error inesperado al cargar nóminas');
    } finally {
      setLoading(false);
    }
  };

  const generatePayroll = async (employeeId: string, periodStart: string, periodEnd: string) => {
    try {
      // Get employee data
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (empError || !employee) {
        toast.error('Error al obtener datos del empleado');
        return false;
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

      if (error) {
        console.error('Error generating payroll:', error);
        toast.error('Error al generar nómina: ' + error.message);
        return false;
      }

      toast.success('Nómina generada exitosamente');
      await fetchPayrollRecords();
      return true;
    } catch (error) {
      console.error('Error in generatePayroll:', error);
      toast.error('Error inesperado al generar nómina');
      return false;
    }
  };

  const updatePayrollStatus = async (payrollId: string, status: 'draft' | 'approved' | 'paid') => {
    try {
      const updates: any = { status };
      if (status === 'paid') {
        updates.payment_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('employee_payroll')
        .update(updates)
        .eq('id', payrollId);

      if (error) {
        console.error('Error updating payroll status:', error);
        toast.error('Error al actualizar estado de nómina');
        return false;
      }

      toast.success('Estado de nómina actualizado');
      await fetchPayrollRecords();
      return true;
    } catch (error) {
      console.error('Error in updatePayrollStatus:', error);
      toast.error('Error inesperado al actualizar estado');
      return false;
    }
  };

  useEffect(() => {
    fetchPayrollRecords();
  }, [restaurantId]);

  return {
    payrollRecords,
    loading,
    fetchPayrollRecords,
    generatePayroll,
    updatePayrollStatus
  };
};
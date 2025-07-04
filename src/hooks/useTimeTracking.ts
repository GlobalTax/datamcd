import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeTimeTracking } from '@/types/employee';
import { toast } from 'sonner';

export const useTimeTracking = (restaurantId?: string) => {
  const [timeRecords, setTimeRecords] = useState<EmployeeTimeTracking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeRecords = async (date?: string, employeeId?: string) => {
    try {
      setLoading(true);
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

      if (error) {
        console.error('Error fetching time records:', error);
        toast.error('Error al cargar registros de horarios');
        return;
      }

      setTimeRecords((data || []) as EmployeeTimeTracking[]);
    } catch (error) {
      console.error('Error in fetchTimeRecords:', error);
      toast.error('Error inesperado al cargar registros');
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async (employeeId: string) => {
    try {
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
        toast.error('El empleado ya tiene entrada registrada hoy');
        return false;
      }

      const { error } = await supabase
        .from('employee_time_tracking')
        .insert({
          employee_id: employeeId,
          date: today,
          clock_in: now.toISOString()
        });

      if (error) {
        console.error('Error clocking in:', error);
        toast.error('Error al registrar entrada');
        return false;
      }

      toast.success('Entrada registrada exitosamente');
      await fetchTimeRecords();
      return true;
    } catch (error) {
      console.error('Error in clockIn:', error);
      toast.error('Error inesperado al registrar entrada');
      return false;
    }
  };

  const clockOut = async (employeeId: string) => {
    try {
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
        toast.error('No se encontró entrada para hoy');
        return false;
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

      if (error) {
        console.error('Error clocking out:', error);
        toast.error('Error al registrar salida');
        return false;
      }

      toast.success('Salida registrada exitosamente');
      await fetchTimeRecords();
      return true;
    } catch (error) {
      console.error('Error in clockOut:', error);
      toast.error('Error inesperado al registrar salida');
      return false;
    }
  };

  const updateTimeRecord = async (recordId: string, updates: Partial<EmployeeTimeTracking>) => {
    try {
      const { error } = await supabase
        .from('employee_time_tracking')
        .update(updates)
        .eq('id', recordId);

      if (error) {
        console.error('Error updating time record:', error);
        toast.error('Error al actualizar registro');
        return false;
      }

      toast.success('Registro actualizado exitosamente');
      await fetchTimeRecords();
      return true;
    } catch (error) {
      console.error('Error in updateTimeRecord:', error);
      toast.error('Error inesperado al actualizar registro');
      return false;
    }
  };

  useEffect(() => {
    fetchTimeRecords();
  }, [restaurantId]);

  return {
    timeRecords,
    loading,
    fetchTimeRecords,
    clockIn,
    clockOut,
    updateTimeRecord
  };
};
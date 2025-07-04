import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeTimeOff } from '@/types/employee';
import { toast } from 'sonner';

export const useTimeOff = (restaurantId?: string) => {
  const [timeOffRequests, setTimeOffRequests] = useState<EmployeeTimeOff[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeOffRequests = async () => {
    try {
      setLoading(true);
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

      if (error) {
        console.error('Error fetching time off requests:', error);
        toast.error('Error al cargar solicitudes de vacaciones');
        return;
      }

      setTimeOffRequests((data || []) as EmployeeTimeOff[]);
    } catch (error) {
      console.error('Error in fetchTimeOffRequests:', error);
      toast.error('Error inesperado al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const createTimeOffRequest = async (request: Omit<EmployeeTimeOff, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('employee_time_off')
        .insert(request);

      if (error) {
        console.error('Error creating time off request:', error);
        toast.error('Error al crear solicitud: ' + error.message);
        return false;
      }

      toast.success('Solicitud creada exitosamente');
      await fetchTimeOffRequests();
      return true;
    } catch (error) {
      console.error('Error in createTimeOffRequest:', error);
      toast.error('Error inesperado al crear solicitud');
      return false;
    }
  };

  const updateTimeOffRequest = async (requestId: string, updates: Partial<EmployeeTimeOff>) => {
    try {
      const { error } = await supabase
        .from('employee_time_off')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error updating time off request:', error);
        toast.error('Error al actualizar solicitud: ' + error.message);
        return false;
      }

      toast.success('Solicitud actualizada exitosamente');
      await fetchTimeOffRequests();
      return true;
    } catch (error) {
      console.error('Error in updateTimeOffRequest:', error);
      toast.error('Error inesperado al actualizar solicitud');
      return false;
    }
  };

  const approveTimeOffRequest = async (requestId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('employee_time_off')
        .update({
          status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error approving time off request:', error);
        toast.error('Error al aprobar solicitud: ' + error.message);
        return false;
      }

      toast.success('Solicitud aprobada exitosamente');
      await fetchTimeOffRequests();
      return true;
    } catch (error) {
      console.error('Error in approveTimeOffRequest:', error);
      toast.error('Error inesperado al aprobar solicitud');
      return false;
    }
  };

  const rejectTimeOffRequest = async (requestId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('employee_time_off')
        .update({
          status: 'rejected',
          approved_by: userId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting time off request:', error);
        toast.error('Error al rechazar solicitud: ' + error.message);
        return false;
      }

      toast.success('Solicitud rechazada');
      await fetchTimeOffRequests();
      return true;
    } catch (error) {
      console.error('Error in rejectTimeOffRequest:', error);
      toast.error('Error inesperado al rechazar solicitud');
      return false;
    }
  };

  useEffect(() => {
    fetchTimeOffRequests();
  }, [restaurantId]);

  return {
    timeOffRequests,
    loading,
    createTimeOffRequest,
    updateTimeOffRequest,
    approveTimeOffRequest,
    rejectTimeOffRequest,
    refetch: fetchTimeOffRequests
  };
};
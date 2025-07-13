import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrquestService, OrquestSyncResponse } from '@/types/orquest';
import { useToast } from '@/hooks/use-toast';

interface OrquestEmployee {
  id: string;
  service_id: string;
  nombre: string | null;
  apellidos: string | null;
  email: string | null;
  telefono: string | null;
  puesto: string | null;
  departamento: string | null;
  fecha_alta: string | null;
  fecha_baja: string | null;
  estado: string | null;
  datos_completos: any;
  updated_at: string | null;
}

export const useOrquest = () => {
  const [services, setServices] = useState<OrquestService[]>([]);
  const [employees, setEmployees] = useState<OrquestEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('servicios_orquest')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      setServices(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar servicios de Orquest';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('orquest_employees')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      setEmployees(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar empleados de Orquest';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncWithOrquest = async (): Promise<OrquestSyncResponse | null> => {
    try {
      setLoading(true);
      
      const { data, error: syncError } = await supabase.functions.invoke('orquest-sync', {
        body: { action: 'sync_all' }
      });

      if (syncError) throw syncError;

      await Promise.all([fetchServices(), fetchEmployees()]); // Refresh data
      
      const successMessage = data.employees_updated 
        ? `${data.services_updated} servicios y ${data.employees_updated} empleados actualizados`
        : `${data.services_updated} servicios actualizados`;
      
      toast({
        title: "Sincronización exitosa",
        description: successMessage,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la sincronización';
      setError(errorMessage);
      toast({
        title: "Error de sincronización",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const syncEmployeesOnly = async (): Promise<OrquestSyncResponse | null> => {
    try {
      setLoading(true);
      
      const { data, error: syncError } = await supabase.functions.invoke('orquest-sync', {
        body: { action: 'sync_employees' }
      });

      if (syncError) throw syncError;

      await fetchEmployees(); // Refresh employees data
      
      toast({
        title: "Sincronización de empleados exitosa",
        description: `${data.employees_updated || 0} empleados actualizados`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la sincronización de empleados';
      setError(errorMessage);
      toast({
        title: "Error de sincronización",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (serviceId: string, updates: Partial<OrquestService>) => {
    try {
      const { error: updateError } = await supabase
        .from('servicios_orquest')
        .update(updates)
        .eq('id', serviceId);

      if (updateError) throw updateError;

      await fetchServices(); // Refresh data
      
      toast({
        title: "Servicio actualizado",
        description: "El servicio se ha actualizado correctamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar servicio';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    Promise.all([fetchServices(), fetchEmployees()]);
  }, []);

  return {
    services,
    employees,
    loading,
    error,
    fetchServices,
    fetchEmployees,
    syncWithOrquest,
    syncEmployeesOnly,
    updateService,
  };
};
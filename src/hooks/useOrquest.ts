import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrquestService, OrquestSyncResponse } from '@/types/orquest';
import { useToast } from '@/hooks/use-toast';

export const useOrquest = () => {
  const [services, setServices] = useState<OrquestService[]>([]);
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

  const syncWithOrquest = async (): Promise<OrquestSyncResponse | null> => {
    try {
      setLoading(true);
      
      const { data, error: syncError } = await supabase.functions.invoke('orquest-sync', {
        body: { action: 'sync_all' }
      });

      if (syncError) throw syncError;

      await fetchServices(); // Refresh data
      
      toast({
        title: "Sincronización exitosa",
        description: `${data.services_updated} servicios actualizados`,
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
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    fetchServices,
    syncWithOrquest,
    updateService,
  };
};
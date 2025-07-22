import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IntegrationConfig {
  id: string;
  provider_id?: string;
  provider_name?: string;
  pos_system?: string;
  pos_name?: string;
  accounting_system?: string;
  system_name?: string;
  is_enabled: boolean;
  sync_options?: object;
  created_at: string;
  updated_at: string;
}

export const useSecureIntegration = (integrationType: 'delivery' | 'pos' | 'accounting', franchiseeId?: string) => {
  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConfigs = async () => {
    if (!franchiseeId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke(`${integrationType}-integration`, {
        body: { franchisee_id: franchiseeId },
        method: 'GET'
      });

      if (fetchError) {
        throw fetchError;
      }

      setConfigs(data.configs || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading configurations';
      setError(errorMessage);
      console.error(`Error fetching ${integrationType} configs:`, err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: any) => {
    if (!franchiseeId) {
      toast({
        title: "Error",
        description: "Se requiere un franquiciado válido",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: saveError } = await supabase.functions.invoke(`${integrationType}-integration`, {
        body: {
          franchisee_id: franchiseeId,
          ...configData
        },
        method: 'POST'
      });

      if (saveError) {
        throw saveError;
      }

      toast({
        title: "Configuración guardada",
        description: `La configuración de ${integrationType} se ha guardado correctamente`,
      });

      await fetchConfigs(); // Refresh configs
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving configuration';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (franchiseeId) {
      fetchConfigs();
    }
  }, [integrationType, franchiseeId]);

  return {
    configs,
    loading,
    error,
    fetchConfigs,
    saveConfig
  };
};
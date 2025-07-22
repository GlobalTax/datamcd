
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecureConfigResponse {
  config: any;
  base_config: any;
  is_configured: boolean;
}

export const useSecureConfig = (integrationType: 'orquest' | 'biloop' | 'quantum', franchiseeId?: string) => {
  const [config, setConfig] = useState<SecureConfigResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConfig = async () => {
    if (!franchiseeId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke('secure-config', {
        body: {
          integration_type: integrationType,
          franchisee_id: franchiseeId
        }
      });

      if (fetchError) {
        throw fetchError;
      }

      setConfig(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading configuration';
      setError(errorMessage);
      console.error('Error fetching secure config:', err);
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

      const { data, error: saveError } = await supabase.functions.invoke('secure-config', {
        body: {
          integration_type: integrationType,
          franchisee_id: franchiseeId,
          config_data: configData
        }
      });

      if (saveError) {
        throw saveError;
      }

      toast({
        title: "Configuración guardada",
        description: `La configuración de ${integrationType} se ha guardado correctamente`,
      });

      await fetchConfig(); // Refresh config
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
      fetchConfig();
    }
  }, [integrationType, franchiseeId]);

  return {
    config,
    loading,
    error,
    fetchConfig,
    saveConfig,
    isConfigured: config?.is_configured || false
  };
};

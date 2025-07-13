import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrquestConfig {
  api_key: string;
  base_url: string;
  business_id: string;
}

export const useOrquestConfig = () => {
  const [config, setConfig] = useState<OrquestConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error: fetchError } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('integration_type', 'orquest')
        .eq('advisor_id', user.data.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        const configuration = data.configuration as any;
        setConfig({
          api_key: configuration?.api_key || '',
          base_url: configuration?.base_url || 'https://pre-mc.orquest.es',
          business_id: configuration?.business_id || 'MCDONALDS_ES',
        });
      } else {
        setConfig(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar configuración';
      setError(errorMessage);
      console.error('Error fetching Orquest config:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: OrquestConfig) => {
    try {
      setLoading(true);
      setError(null);

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Usuario no autenticado');
      }

      const configData = {
        advisor_id: user.data.user.id,
        integration_type: 'orquest',
        config_name: 'Orquest API Configuration',
        configuration: newConfig as any,
        api_endpoint: newConfig.base_url,
        is_active: true,
      };

      const { error } = await supabase
        .from('integration_configs')
        .upsert(configData, {
          onConflict: 'advisor_id,integration_type'
        });

      if (error) throw error;

      setConfig(newConfig);

      toast({
        title: "Configuración guardada",
        description: "La configuración de Orquest se ha guardado correctamente",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar configuración';
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

  const isConfigured = () => {
    return config && config.api_key && config.base_url;
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    error,
    fetchConfig,
    saveConfig,
    isConfigured,
  };
};
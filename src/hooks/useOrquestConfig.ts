import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrquestConfig {
  api_key: string;
  base_url: string;
  business_id: string;
}

export const useOrquestConfig = (franchiseeId?: string) => {
  const [config, setConfig] = useState<OrquestConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConfig = async (targetFranchiseeId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Usuario no autenticado');
      }

      if (!targetFranchiseeId) {
        setConfig(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('integration_type', 'orquest')
        .eq('franchisee_id', targetFranchiseeId)
        .maybeSingle();

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

  // Función para validar si es un UUID válido
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Función para detectar si es un ID de fallback
  const isFallbackId = (id: string): boolean => {
    return id.startsWith('fallback-');
  };

  const saveConfig = async (newConfig: OrquestConfig, targetFranchiseeId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Usuario no autenticado');
      }

      if (!targetFranchiseeId) {
        throw new Error('Se requiere un franquiciado para guardar la configuración');
      }

      // Validar si es un ID de fallback
      if (isFallbackId(targetFranchiseeId)) {
        throw new Error('No se puede guardar la configuración en modo fallback. Por favor, verifica tu conexión e intenta nuevamente.');
      }

      // Validar si es un UUID válido
      if (!isValidUUID(targetFranchiseeId)) {
        throw new Error('ID de franquiciado inválido. Por favor, recarga la página e intenta nuevamente.');
      }

      const configData = {
        advisor_id: user.data.user.id,
        franchisee_id: targetFranchiseeId,
        integration_type: 'orquest',
        config_name: 'Orquest API Configuration',
        configuration: newConfig as any,
        api_endpoint: newConfig.base_url,
        is_active: true,
      };

      const { error } = await supabase
        .from('integration_configs')
        .upsert(configData, {
          onConflict: 'franchisee_id,integration_type'
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
    if (franchiseeId) {
      fetchConfig(franchiseeId);
    }
  }, [franchiseeId]);

  return {
    config,
    loading,
    error,
    fetchConfig,
    saveConfig,
    isConfigured,
  };
};
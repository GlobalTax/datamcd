import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BiloopConfig {
  company_id: string;
}

export const useBiloopConfig = (franchiseeId?: string) => {
  const [config, setConfig] = useState<BiloopConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConfig = async (targetFranchiseeId?: string) => {
    if (!targetFranchiseeId || !isValidUUID(targetFranchiseeId)) {
      setConfig(null);
      return;
    }

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
        .eq('integration_type', 'biloop')
        .eq('franchisee_id', targetFranchiseeId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        const configuration = data.configuration as any;
        setConfig({
          company_id: configuration?.company_id || '',
        });
      } else {
        setConfig(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar configuración de Biloop';
      setError(errorMessage);
      console.error('Error fetching Biloop config:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: BiloopConfig, targetFranchiseeId: string) => {
    try {
      setLoading(true);
      setError(null);

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Usuario no autenticado');
      }

      if (!isValidUUID(targetFranchiseeId)) {
        throw new Error('ID de franquiciado inválido');
      }

      const configData = {
        advisor_id: user.data.user.id,
        franchisee_id: targetFranchiseeId,
        integration_type: 'biloop',
        config_name: 'Biloop API Configuration',
        configuration: newConfig as any,
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
        description: "La configuración de Biloop se ha guardado correctamente",
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

  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const isConfigured = () => {
    return config && config.company_id;
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
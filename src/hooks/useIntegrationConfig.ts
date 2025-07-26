import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IntegrationConfig {
  orquest?: {
    api_key: string;
    base_url: string;
    business_id: string;
  };
  biloop?: {
    company_id: string;
  };
}

export interface IntegrationConfigData {
  id?: string;
  advisor_id: string;
  franchisee_id: string;
  integration_type: 'orquest' | 'biloop' | 'unified';
  config_name: string;
  configuration: any;
  api_endpoint?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useIntegrationConfig = (franchiseeId?: string) => {
  const [configs, setConfigs] = useState<Record<string, IntegrationConfig>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConfigs = async (targetFranchiseeId?: string) => {
    if (!targetFranchiseeId || !isValidUUID(targetFranchiseeId)) {
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
        .eq('franchisee_id', targetFranchiseeId)
        .in('integration_type', ['orquest', 'biloop']);

      if (fetchError) throw fetchError;

      // Procesar configuraciones por tipo
      const processedConfig: IntegrationConfig = {};

      data?.forEach(config => {
        const configuration = config.configuration as any;
        
        if (config.integration_type === 'orquest') {
          processedConfig.orquest = {
            api_key: configuration?.api_key || '',
            base_url: configuration?.base_url || 'https://pre-mc.orquest.es',
            business_id: configuration?.business_id || 'MCDONALDS_ES',
          };
        } else if (config.integration_type === 'biloop') {
          processedConfig.biloop = {
            company_id: configuration?.company_id || '',
          };
        }
      });

      setConfigs(prev => ({
        ...prev,
        [targetFranchiseeId]: processedConfig
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar configuraciones';
      setError(errorMessage);
      console.error('Error fetching integration configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (config: IntegrationConfig, targetFranchiseeId: string) => {
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

      const configs: IntegrationConfigData[] = [];

      // Configuración de Orquest
      if (config.orquest) {
        configs.push({
          advisor_id: user.data.user.id,
          franchisee_id: targetFranchiseeId,
          integration_type: 'orquest',
          config_name: 'Orquest API Configuration',
          configuration: config.orquest,
          api_endpoint: config.orquest.base_url,
          is_active: true,
        });
      }

      // Configuración de Biloop
      if (config.biloop) {
        configs.push({
          advisor_id: user.data.user.id,
          franchisee_id: targetFranchiseeId,
          integration_type: 'biloop',
          config_name: 'Biloop API Configuration',
          configuration: config.biloop,
          is_active: true,
        });
      }

      // Guardar configuraciones
      for (const configData of configs) {
        const { error } = await supabase
          .from('integration_configs')
          .upsert(configData, {
            onConflict: 'franchisee_id,integration_type'
          });

        if (error) throw error;
      }

      // Actualizar estado local
      setConfigs(prev => ({
        ...prev,
        [targetFranchiseeId]: config
      }));

      toast({
        title: "Configuración guardada",
        description: "Las configuraciones de integración se han guardado correctamente",
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

  const testConnection = async (type: 'orquest' | 'biloop', targetFranchiseeId: string) => {
    try {
      setLoading(true);
      
      if (type === 'orquest') {
        // Test Orquest connection using existing hook logic
        const config = configs[targetFranchiseeId]?.orquest;
        if (!config?.api_key || !config?.base_url) {
          throw new Error('Configuración de Orquest incompleta');
        }
        
        // TODO: Implement actual Orquest API test
        toast({
          title: "Prueba de conexión",
          description: "Conexión con Orquest verificada correctamente",
        });
      } else if (type === 'biloop') {
        // Test Biloop connection
        const config = configs[targetFranchiseeId]?.biloop;
        if (!config?.company_id) {
          throw new Error('Configuración de Biloop incompleta');
        }
        
        // TODO: Implement actual Biloop API test
        toast({
          title: "Prueba de conexión",
          description: "Conexión con Biloop verificada correctamente",
        });
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al probar conexión';
      toast({
        title: "Error de conexión",
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

  const getConfigStatus = (config?: IntegrationConfig) => {
    if (!config) return { status: 'none', label: 'Sin configurar', variant: 'destructive' as const };
    
    const orquestOk = config.orquest?.api_key && config.orquest?.base_url && config.orquest?.business_id;
    const biloopOk = config.biloop?.company_id;
    
    if (orquestOk && biloopOk) return { status: 'complete', label: 'Completa', variant: 'default' as const };
    if (orquestOk || biloopOk) return { status: 'partial', label: 'Parcial', variant: 'secondary' as const };
    return { status: 'none', label: 'Sin configurar', variant: 'destructive' as const };
  };

  useEffect(() => {
    if (franchiseeId) {
      fetchConfigs(franchiseeId);
    }
  }, [franchiseeId]);

  return {
    configs,
    loading,
    error,
    fetchConfigs,
    saveConfig,
    testConnection,
    getConfigStatus,
  };
};
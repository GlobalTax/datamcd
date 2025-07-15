import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuantumSyncRequest {
  franchisee_id: string;
  restaurant_id?: string;
  period_start: string;
  period_end: string;
  sync_type?: 'manual' | 'automatic';
}

export interface QuantumSyncLog {
  id: string;
  franchisee_id: string;
  restaurant_id: string | null;
  sync_type: string;
  status: string;
  records_processed: number;
  records_imported: number;
  records_skipped: number;
  error_message: string | null;
  sync_started_at: string;
  sync_completed_at: string | null;
  created_at: string;
}

export interface QuantumAccountData {
  id: string;
  franchisee_id: string;
  restaurant_id: string;
  quantum_account_code: string;
  account_name: string;
  account_type: string;
  balance: number;
  period_start: string;
  period_end: string;
  last_sync: string;
  raw_data: any;
}

export function useQuantumIntegration(franchiseeId?: string) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Obtener logs de sincronización
  const { data: syncLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['quantum-sync-logs', franchiseeId],
    queryFn: async () => {
      if (!franchiseeId) return [];
      
      const { data, error } = await supabase
        .from('quantum_sync_logs')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as QuantumSyncLog[];
    },
    enabled: !!franchiseeId
  });

  // Obtener datos contables de Quantum
  const { data: accountingData, isLoading: dataLoading } = useQuery({
    queryKey: ['quantum-accounting-data', franchiseeId],
    queryFn: async () => {
      if (!franchiseeId) return [];
      
      const { data, error } = await supabase
        .from('quantum_accounting_data')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('last_sync', { ascending: false });

      if (error) throw error;
      return data as QuantumAccountData[];
    },
    enabled: !!franchiseeId
  });

  // Obtener mapeos de cuentas
  const { data: accountMappings } = useQuery({
    queryKey: ['quantum-account-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quantum_account_mapping')
        .select('*')
        .eq('is_active', true)
        .order('quantum_account_code');

      if (error) throw error;
      return data;
    }
  });

  // Mutación para sincronizar datos
  const syncMutation = useMutation({
    mutationFn: async (request: QuantumSyncRequest) => {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('quantum-integration', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Sincronización completada: ${data.records_imported} registros importados`);
      queryClient.invalidateQueries({ queryKey: ['quantum-sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['quantum-accounting-data'] });
      queryClient.invalidateQueries({ queryKey: ['profit-loss-data'] });
    },
    onError: (error: any) => {
      toast.error(`Error en sincronización: ${error.message}`);
      console.error('Quantum sync error:', error);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Función para sincronizar manualmente
  const syncQuantumData = async (request: QuantumSyncRequest) => {
    return syncMutation.mutateAsync(request);
  };

  // Obtener último log de sincronización
  const lastSync = syncLogs?.[0];

  // Estadísticas de sincronización
  const syncStats = {
    lastSyncDate: lastSync?.sync_completed_at,
    lastSyncStatus: lastSync?.status,
    totalRecordsProcessed: syncLogs?.reduce((sum, log) => sum + log.records_processed, 0) || 0,
    totalRecordsImported: syncLogs?.reduce((sum, log) => sum + log.records_imported, 0) || 0,
    successfulSyncs: syncLogs?.filter(log => log.status === 'success').length || 0,
    failedSyncs: syncLogs?.filter(log => log.status === 'error').length || 0
  };

  return {
    syncLogs,
    accountingData,
    accountMappings,
    syncStats,
    lastSync,
    isLoading: isLoading || logsLoading || dataLoading,
    isSyncing: syncMutation.isPending,
    syncQuantumData,
    error: syncMutation.error
  };
}
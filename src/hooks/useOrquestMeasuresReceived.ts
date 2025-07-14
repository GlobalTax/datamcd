import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';

export interface OrquestMeasureReceived {
  id: string;
  service_id: string;
  measure_type: string;
  value: number;
  from_time: string;
  to_time: string;
  measure_category: string;
  franchisee_id: string;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

export interface FetchMeasuresResponse {
  success: boolean;
  measures_fetched: number;
  service_id?: string;
  period?: { from: string; to: string };
  error?: string;
}

export const useOrquestMeasuresReceived = (franchiseeId?: string) => {
  const [measures, setMeasures] = useState<OrquestMeasureReceived[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUnifiedAuth();

  const fetchMeasures = async (): Promise<void> => {
    if (!franchiseeId && !user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orquest_measures')
        .select('*')
        .eq('franchisee_id', franchiseeId || user?.franchiseeId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setMeasures(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching measures');
      console.error('Error fetching received measures:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeasuresFromOrquest = async (
    serviceId: string,
    startDate: string,
    endDate: string,
    demandTypes?: string[]
  ): Promise<FetchMeasuresResponse | null> => {
    if (!franchiseeId && !user?.franchiseeId) {
      throw new Error('Franchisee ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('orquest-sync', {
        body: {
          action: 'fetch_measures',
          franchiseeId: franchiseeId || user?.franchiseeId,
          serviceId,
          startDate,
          endDate,
          demandTypes: demandTypes || ['SALES', 'TICKETS']
        }
      });

      if (invokeError) throw invokeError;

      // Refresh measures after successful fetch
      if (data?.success) {
        await fetchMeasures();
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching measures from Orquest';
      setError(errorMessage);
      console.error('Error fetching measures from Orquest:', err);
      return {
        success: false,
        measures_fetched: 0,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const getMeasuresByService = (serviceId: string): OrquestMeasureReceived[] => {
    return measures.filter(measure => measure.service_id === serviceId);
  };

  const getMeasuresByType = (measureType: string): OrquestMeasureReceived[] => {
    return measures.filter(measure => measure.measure_type === measureType);
  };

  const getMeasuresByPeriod = (startDate: string, endDate: string): OrquestMeasureReceived[] => {
    return measures.filter(measure => {
      const fromTime = new Date(measure.from_time);
      const toTime = new Date(measure.to_time);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return fromTime >= start && toTime <= end;
    });
  };

  const getRecentMeasures = (days: number = 7): OrquestMeasureReceived[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return measures.filter(measure => 
      new Date(measure.created_at) >= cutoffDate
    );
  };

  useEffect(() => {
    if (franchiseeId || user?.franchiseeId) {
      fetchMeasures();
    }
  }, [franchiseeId, user?.franchiseeId]);

  return {
    measures,
    loading,
    error,
    fetchMeasures,
    fetchMeasuresFromOrquest,
    getMeasuresByService,
    getMeasuresByType,
    getMeasuresByPeriod,
    getRecentMeasures
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  OrquestMeasure, 
  OrquestMeasureType, 
  OrquestMeasuresSyncResponse,
  OrquestMeasuresQueryParams 
} from '@/types/orquest';
import { useToast } from '@/hooks/use-toast';

export const useOrquestMeasuresExtended = (franchiseeId?: string) => {
  const [measures, setMeasures] = useState<OrquestMeasure[]>([]);
  const [measureTypes, setMeasureTypes] = useState<OrquestMeasureType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMeasures = async (params?: OrquestMeasuresQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('orquest_measures')
        .select('*')
        .order('from_time', { ascending: false });

      if (params) {
        if (params.service_id) {
          query = query.eq('service_id', params.service_id);
        }
        if (params.from_date) {
          query = query.gte('from_time', `${params.from_date}T00:00:00Z`);
        }
        if (params.to_date) {
          query = query.lte('from_time', `${params.to_date}T23:59:59Z`);
        }
        if (params.measure_types && params.measure_types.length > 0) {
          query = query.in('measure_type', params.measure_types);
        }
        if (params.category) {
          query = query.eq('measure_category', params.category);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setMeasures((data || []) as OrquestMeasure[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar medidas de Orquest';
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

  const fetchMeasureTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('orquest_measure_types')
        .select('*')
        .eq('is_active', true)
        .order('display_name');

      if (fetchError) throw fetchError;

      setMeasureTypes(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tipos de medidas';
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

  const syncMeasuresFromOrquest = async (
    serviceId: string, 
    date: string
  ): Promise<OrquestMeasuresSyncResponse | null> => {
    try {
      setLoading(true);
      
      if (!franchiseeId) {
        throw new Error('franchiseeId is required for sync operations');
      }
      
      const { data, error: syncError } = await supabase.functions.invoke('orquest-sync', {
        body: { 
          action: 'fetch_measures', 
          franchiseeId,
          serviceId,
          startDate: date,
          endDate: date,
          demandTypes: ['SALES', 'TICKETS', 'FOOTFALL', 'ORDERS', 'AVERAGE_TICKET']
        }
      });

      if (syncError) throw syncError;

      await fetchMeasures({ service_id: serviceId, from_date: date, to_date: date });
      
      toast({
        title: "Sincronización exitosa",
        description: `${data.measures_fetched} medidas actualizadas desde Orquest`,
      });

      return {
        success: true,
        measures_updated: data.measures_fetched || 0,
        measures_sent: 0,
        last_sync: new Date().toISOString(),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la sincronización de medidas';
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

  const addMeasure = async (measure: Omit<OrquestMeasure, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: insertError } = await supabase
        .from('orquest_measures')
        .insert(measure);

      if (insertError) throw insertError;

      await fetchMeasures();
      
      toast({
        title: "Medida agregada",
        description: "La medida se ha agregado correctamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar medida';
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

  const updateMeasure = async (id: string, updates: Partial<OrquestMeasure>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: updateError } = await supabase
        .from('orquest_measures')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchMeasures();
      
      toast({
        title: "Medida actualizada",
        description: "La medida se ha actualizado correctamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar medida';
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

  const deleteMeasure = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('orquest_measures')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchMeasures();
      
      toast({
        title: "Medida eliminada",
        description: "La medida se ha eliminado correctamente",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar medida';
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

  // Utilidades
  const getMeasuresByService = (serviceId: string): OrquestMeasure[] => {
    return measures.filter(m => m.service_id === serviceId);
  };

  const getMeasuresByType = (measureType: string): OrquestMeasure[] => {
    return measures.filter(m => m.measure_type === measureType);
  };

  const getMeasuresByPeriod = (startDate: string, endDate: string): OrquestMeasure[] => {
    return measures.filter(m => 
      m.from_time >= `${startDate}T00:00:00Z` && 
      m.from_time <= `${endDate}T23:59:59Z`
    );
  };

  const getRecentMeasures = (days: number = 7): OrquestMeasure[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return measures.filter(m => new Date(m.from_time) >= cutoffDate);
  };

  const getMeasureTypeInfo = (measureType: string): OrquestMeasureType | undefined => {
    return measureTypes.find(mt => mt.measure_type === measureType);
  };

  const formatMeasureValue = (value: number, measureType: string): string => {
    const typeInfo = getMeasureTypeInfo(measureType);
    const unit = typeInfo?.unit;
    
    if (unit === 'EUR') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    }
    if (unit === 'PERCENTAGE') {
      return `${value.toFixed(2)}%`;
    }
    if (unit === 'HOURS') {
      return `${value.toFixed(1)}h`;
    }
    if (unit === 'SCORE') {
      return `${value.toFixed(1)} pts`;
    }
    return value.toFixed(2);
  };

  const getMeasureDisplayName = (measureType: string): string => {
    const typeInfo = getMeasureTypeInfo(measureType);
    return typeInfo?.display_name || measureType;
  };

  useEffect(() => {
    fetchMeasureTypes();
  }, []);

  return {
    measures,
    measureTypes,
    loading,
    error,
    fetchMeasures,
    fetchMeasureTypes,
    syncMeasuresFromOrquest,
    addMeasure,
    updateMeasure,
    deleteMeasure,
    getMeasuresByService,
    getMeasuresByType,
    getMeasuresByPeriod,
    getRecentMeasures,
    getMeasureTypeInfo,
    formatMeasureValue,
    getMeasureDisplayName,
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrquestMeasureSent {
  id: string;
  franchisee_id: string;
  service_id: string;
  measure_type: string;
  value: number;
  period_from: string;
  period_to: string;
  restaurant_id?: string;
  sent_at: string;
  status: string;
  error_message?: string;
  orquest_response?: any;
  created_at: string;
  updated_at: string;
}

export interface SendMeasureResponse {
  success: boolean;
  measures_sent: number;
  measure_type?: string;
  value?: number;
  service_id?: string;
  error?: string;
}

export const useOrquestMeasures = (franchiseeId?: string) => {
  const [measures, setMeasures] = useState<OrquestMeasureSent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMeasures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('orquest_measures_sent')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      setMeasures(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar medidas enviadas';
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

  const sendMeasure = async (
    serviceId: string,
    measureType: string,
    periodFrom: string,
    periodTo: string
  ): Promise<SendMeasureResponse | null> => {
    try {
      setLoading(true);
      
      if (!franchiseeId) {
        throw new Error('franchiseeId is required for sending measures');
      }
      
      const { data, error: sendError } = await supabase.functions.invoke('orquest-sync', {
        body: { 
          action: 'send_measures', 
          franchiseeId,
          serviceId,
          measureType,
          periodFrom,
          periodTo
        }
      });

      if (sendError) throw sendError;

      await fetchMeasures(); // Refresh measures
      
      toast({
        title: "Medida enviada exitosamente",
        description: `${measureType}: ${data.value} enviado a servicio ${serviceId}`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar medida';
      setError(errorMessage);
      toast({
        title: "Error al enviar medida",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendSalesData = async (serviceId: string, periodFrom: string, periodTo: string) => {
    return sendMeasure(serviceId, 'SALES', periodFrom, periodTo);
  };

  const sendLaborCostData = async (serviceId: string, periodFrom: string, periodTo: string) => {
    return sendMeasure(serviceId, 'LABOR_COST', periodFrom, periodTo);
  };

  const sendFoodCostData = async (serviceId: string, periodFrom: string, periodTo: string) => {
    return sendMeasure(serviceId, 'FOOD_COST', periodFrom, periodTo);
  };

  const sendOperatingExpensesData = async (serviceId: string, periodFrom: string, periodTo: string) => {
    return sendMeasure(serviceId, 'OPERATING_EXPENSES', periodFrom, periodTo);
  };

  const sendNetProfitData = async (serviceId: string, periodFrom: string, periodTo: string) => {
    return sendMeasure(serviceId, 'NET_PROFIT', periodFrom, periodTo);
  };

  const getMeasuresByService = (serviceId: string) => {
    return measures.filter(m => m.service_id === serviceId);
  };

  const getMeasuresByType = (measureType: string) => {
    return measures.filter(m => m.measure_type === measureType);
  };

  const getRecentMeasures = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return measures.filter(m => new Date(m.sent_at) >= cutoffDate);
  };

  useEffect(() => {
    fetchMeasures();
  }, []);

  return {
    measures,
    loading,
    error,
    fetchMeasures,
    sendMeasure,
    sendSalesData,
    sendLaborCostData,
    sendFoodCostData,
    sendOperatingExpensesData,
    sendNetProfitData,
    getMeasuresByService,
    getMeasuresByType,
    getRecentMeasures,
  };
};
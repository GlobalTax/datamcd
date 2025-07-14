import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface OrquestForecastSent {
  id: string;
  service_id: string;
  forecast_type: string;
  period_from: string;
  period_to: string;
  forecast_data: any;
  franchisee_id: string;
  restaurant_id: string | null;
  status: string;
  sent_at: string;
  orquest_response: any;
  error_message: string | null;
}

export const useOrquestForecasts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener historial de forecasts enviados
  const { data: forecasts, isLoading: isLoadingForecasts } = useQuery({
    queryKey: ['orquest-forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orquest_forecasts_sent')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data as OrquestForecastSent[];
    }
  });

  // Mutación para enviar forecasts
  const sendForecastsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('orquest-sync', {
        body: { action: 'send_forecast' }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Forecasts enviados exitosamente",
        description: `Se enviaron ${data.forecasts_sent} forecasts a Orquest`,
      });
      queryClient.invalidateQueries({ queryKey: ['orquest-forecasts'] });
    },
    onError: (error: any) => {
      console.error('Error sending forecasts:', error);
      toast({
        title: "Error al enviar forecasts",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    }
  });

  const sendForecasts = () => {
    sendForecastsMutation.mutate();
  };

  return {
    forecasts: forecasts || [],
    isLoading: isLoadingForecasts || sendForecastsMutation.isPending,
    sendForecasts,
    error: sendForecastsMutation.error
  };
};
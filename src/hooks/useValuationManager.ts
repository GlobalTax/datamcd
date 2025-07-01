
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface RestaurantValuation {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  valuation_name: string;
  discount_rate: number;
  growth_rate: number;
  inflation_rate: number;
  valuation_date: string;
  yearly_data: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useValuationManager = () => {
  const [loading, setLoading] = useState(false);
  const [valuations, setValuations] = useState<RestaurantValuation[]>([]);

  const saveValuation = useCallback(async (valuationData: {
    restaurant_id: string;
    restaurant_name: string;
    valuation_name: string;
    valuation_data: any;
  }) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('restaurant_valuations')
        .insert({
          restaurant_id: valuationData.restaurant_id,
          restaurant_name: valuationData.restaurant_name,
          valuation_name: valuationData.valuation_name,
          discount_rate: 21.0,
          growth_rate: 3.0,
          inflation_rate: 1.5,
          valuation_date: new Date().toISOString().split('T')[0],
          yearly_data: valuationData.valuation_data,
          created_by: null
        })
        .select()
        .single();

      if (error) throw error;
      
      showSuccess('Valoración guardada correctamente');
      return data;
    } catch (error) {
      console.error('Error saving valuation:', error);
      showError('Error al guardar la valoración');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadValuations = useCallback(async (restaurantId?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('restaurant_valuations')
        .select('*')
        .order('created_at', { ascending: false });

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setValuations(data || []);
      return data || [];
    } catch (error) {
      console.error('Error loading valuations:', error);
      showError('Error al cargar las valoraciones');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteValuation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('restaurant_valuations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showSuccess('Valoración eliminada correctamente');
      setValuations(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting valuation:', error);
      showError('Error al eliminar la valoración');
    }
  }, []);

  return {
    loading,
    valuations,
    saveValuation,
    loadValuations,
    deleteValuation
  };
};

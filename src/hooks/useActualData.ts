
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ActualData, ActualDataUpdateParams } from '@/types/actualDataTypes';
import { 
  getMonthKey, 
  getMonthNumber, 
  getFieldMapping, 
  groupDataByCategories 
} from '@/utils/actualDataMappers';

export const useActualData = () => {
  const { user } = useAuth();
  const [actualData, setActualData] = useState<ActualData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActualData = useCallback(async (restaurantId: string, year: number) => {
    if (!user || !restaurantId) return;

    try {
      setLoading(true);
      setError(null);

      // Obtener datos reales de profit_loss_data agrupados por categoría/subcategoría
      const { data, error: queryError } = await supabase
        .from('profit_loss_data')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('year', year);

      if (queryError) {
        console.error('Error fetching actual data:', queryError);
        setError('Error al cargar los datos reales');
        return;
      }

      if (!data || data.length === 0) {
        setActualData([]);
        return;
      }

      // Agrupar datos por categorías similares al presupuesto
      const groupedData = groupDataByCategories(data);

      // Calcular totales
      Object.values(groupedData).forEach(item => {
        item.total = item.jan + item.feb + item.mar + item.apr + item.may + item.jun +
                    item.jul + item.aug + item.sep + item.oct + item.nov + item.dec;
      });

      setActualData(Object.values(groupedData));

    } catch (err) {
      console.error('Error in fetchActualData:', err);
      setError('Error al cargar los datos reales');
      toast.error('Error al cargar los datos reales');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateActualData = useCallback(async (data: ActualDataUpdateParams) => {
    if (!user) return;

    try {
      // Convertir el campo de mes a número
      const monthFields = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthField = Object.keys(data).find(key => monthFields.includes(key));
      
      if (!monthField) {
        throw new Error('No month field found');
      }

      const monthNumber = getMonthNumber(monthField);
      if (!monthNumber) {
        throw new Error('Invalid month field');
      }

      // Buscar registro existente
      const { data: existingData, error: fetchError } = await supabase
        .from('profit_loss_data')
        .select('*')
        .eq('restaurant_id', data.restaurant_id)
        .eq('year', data.year)
        .eq('month', monthNumber)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      // Mapear la categoría y subcategoría a los campos de la base de datos
      const fieldMapping = getFieldMapping(data.category, data.subcategory);
      if (!fieldMapping) {
        throw new Error(`No field mapping found for ${data.category} - ${data.subcategory}`);
      }

      const updateData = {
        [fieldMapping]: data[monthField]
      };

      if (existingData) {
        // Actualizar registro existente
        const { error: updateError } = await supabase
          .from('profit_loss_data')
          .update(updateData)
          .eq('id', existingData.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Crear nuevo registro
        const { error: insertError } = await supabase
          .from('profit_loss_data')
          .insert({
            restaurant_id: data.restaurant_id,
            year: data.year,
            month: monthNumber,
            ...updateData,
            created_by: user.id
          });

        if (insertError) {
          throw insertError;
        }
      }

    } catch (err) {
      console.error('Error updating actual data:', err);
      throw err;
    }
  }, [user]);

  return {
    actualData,
    loading,
    error,
    fetchActualData,
    updateActualData
  };
};

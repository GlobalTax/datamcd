
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

export const useRestaurantUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateRestaurant = async (restaurantId: string, updateData: any) => {
    setIsUpdating(true);
    console.log('updateRestaurant - Starting update for:', restaurantId, updateData);
    
    try {
      const { data, error } = await supabase
        .from('franchisee_restaurants')
        .update({
          monthly_rent: updateData.monthly_rent,
          last_year_revenue: updateData.last_year_revenue,
          franchise_fee_percentage: updateData.franchise_fee_percentage,
          advertising_fee_percentage: updateData.advertising_fee_percentage,
          notes: updateData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId)
        .select();

      if (error) {
        console.error('Error updating restaurant:', error);
        showError('Error al actualizar el restaurante: ' + error.message);
        return false;
      }

      console.log('Restaurant updated successfully:', data);
      showSuccess('Restaurante actualizado correctamente');
      return true;
    } catch (error) {
      console.error('Unexpected error updating restaurant:', error);
      showError('Error inesperado al actualizar el restaurante');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateRestaurant,
    isUpdating
  };
};

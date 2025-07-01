import { supabase } from '@/integrations/supabase/client';
import { RestaurantValuation, ValuationScenario } from '@/types/restaurantValuation';
import { showSuccess, showError } from '@/utils/notifications';

export const fetchValuationsFromDB = async (): Promise<RestaurantValuation[]> => {
  try {
    const { data, error } = await supabase
      .from('restaurant_valuations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching valuations:', error);
    showError('Error al cargar las valoraciones');
    throw error;
  }
};

export const fetchScenariosFromDB = async (valuationId: string): Promise<ValuationScenario[]> => {
  try {
    const { data, error } = await supabase
      .from('valuation_scenarios')
      .select('*')
      .eq('valuation_id', valuationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    showError('Error al cargar los escenarios');
    throw error;
  }
};

export const saveValuationToDB = async (
  valuation: Omit<RestaurantValuation, 'id' | 'created_at' | 'updated_at'>,
  userId?: string
): Promise<RestaurantValuation> => {
  try {
    const { data, error } = await supabase
      .from('restaurant_valuations')
      .insert({
        ...valuation,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error saving valuation:', error);
    showError('Error al guardar la valoración');
    throw error;
  }
};

export const updateValuationInDB = async (
  id: string,
  updates: Partial<RestaurantValuation>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('restaurant_valuations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating valuation:', error);
    showError('Error al actualizar la valoración');
    throw error;
  }
};

export const deleteValuationFromDB = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('restaurant_valuations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting valuation:', error);
    showError('Error al eliminar la valoración');
    throw error;
  }
};

export const saveScenarioToDB = async (
  scenario: Omit<ValuationScenario, 'id' | 'created_at' | 'updated_at'>
): Promise<ValuationScenario> => {
  try {
    const { data, error } = await supabase
      .from('valuation_scenarios')
      .insert(scenario)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error saving scenario:', error);
    showError('Error al guardar el escenario');
    throw error;
  }
};

export const deleteScenarioFromDB = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('valuation_scenarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting scenario:', error);
    showError('Error al eliminar el escenario');
    throw error;
  }
};

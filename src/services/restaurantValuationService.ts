
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
    
    // Transform the data to handle Json types correctly
    const transformedData = (data || []).map(item => ({
      ...item,
      yearly_data: Array.isArray(item.yearly_data) ? item.yearly_data : [],
      projections: typeof item.projections === 'object' ? item.projections : null
    }));
    
    return transformedData;
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
    
    // Transform the data to handle Json types correctly
    const transformedData = (data || []).map(item => ({
      ...item,
      yearly_modifications: typeof item.yearly_modifications === 'object' ? item.yearly_modifications : {},
      projections: typeof item.projections === 'object' ? item.projections : null
    }));
    
    return transformedData;
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
        restaurant_id: valuation.restaurant_id,
        restaurant_name: valuation.restaurant_name,
        valuation_name: valuation.valuation_name,
        valuation_date: valuation.valuation_date,
        discount_rate: valuation.discount_rate,
        growth_rate: valuation.growth_rate,
        inflation_rate: valuation.inflation_rate,
        yearly_data: valuation.yearly_data,
        projections: valuation.projections,
        total_present_value: valuation.total_present_value,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      yearly_data: Array.isArray(data.yearly_data) ? data.yearly_data : [],
      projections: typeof data.projections === 'object' ? data.projections : null
    };
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
      .insert({
        valuation_id: scenario.valuation_id,
        scenario_name: scenario.scenario_name,
        scenario_description: scenario.scenario_description,
        inflation_rate_modifier: scenario.inflation_rate_modifier,
        discount_rate_modifier: scenario.discount_rate_modifier,
        growth_rate_modifier: scenario.growth_rate_modifier,
        yearly_modifications: scenario.yearly_modifications,
        projections: scenario.projections,
        total_present_value: scenario.total_present_value,
        variance_from_base: scenario.variance_from_base,
        variance_percentage: scenario.variance_percentage
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      yearly_modifications: typeof data.yearly_modifications === 'object' ? data.yearly_modifications : {},
      projections: typeof data.projections === 'object' ? data.projections : null
    };
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

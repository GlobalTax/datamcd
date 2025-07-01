
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RestaurantValuation, ValuationScenario } from '@/types/restaurantValuation';
import { showSuccess, showError } from '@/utils/notifications';
import {
  fetchValuationsFromDB,
  fetchScenariosFromDB,
  saveValuationToDB,
  updateValuationInDB,
  deleteValuationFromDB,
  saveScenarioToDB,
  deleteScenarioFromDB
} from '@/services/restaurantValuationService';

export const useRestaurantValuations = () => {
  const { user } = useAuth();
  const [valuations, setValuations] = useState<RestaurantValuation[]>([]);
  const [scenarios, setScenarios] = useState<ValuationScenario[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchValuations = async () => {
    try {
      setLoading(true);
      const typedValuations = await fetchValuationsFromDB();
      setValuations(typedValuations);
    } catch (error) {
      console.error('Error fetching valuations:', error);
      showError('Error al cargar las valoraciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchScenarios = async (valuationId: string) => {
    try {
      const typedScenarios = await fetchScenariosFromDB(valuationId);
      setScenarios(typedScenarios);
      return typedScenarios;
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      showError('Error al cargar los escenarios');
      return [];
    }
  };

  const saveValuation = async (valuation: Omit<RestaurantValuation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const typedData = await saveValuationToDB(valuation, user?.id);
      showSuccess('Valoración guardada correctamente');
      await fetchValuations();
      return typedData;
    } catch (error) {
      console.error('Error saving valuation:', error);
      showError('Error al guardar la valoración');
      throw error;
    }
  };

  const updateValuation = async (id: string, updates: Partial<RestaurantValuation>) => {
    try {
      await updateValuationInDB(id, updates);
      showSuccess('Valoración actualizada correctamente');
      await fetchValuations();
    } catch (error) {
      console.error('Error updating valuation:', error);
      showError('Error al actualizar la valoración');
      throw error;
    }
  };

  const deleteValuation = async (id: string) => {
    try {
      await deleteValuationFromDB(id);
      showSuccess('Valoración eliminada correctamente');
      await fetchValuations();
    } catch (error) {
      console.error('Error deleting valuation:', error);
      showError('Error al eliminar la valoración');
      throw error;
    }
  };

  const saveScenario = async (scenario: Omit<ValuationScenario, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const typedData = await saveScenarioToDB(scenario);
      showSuccess('Escenario guardado correctamente');
      await fetchScenarios(scenario.valuation_id);
      return typedData;
    } catch (error) {
      console.error('Error saving scenario:', error);
      showError('Error al guardar el escenario');
      throw error;
    }
  };

  const deleteScenario = async (id: string, valuationId: string) => {
    try {
      await deleteScenarioFromDB(id);
      showSuccess('Escenario eliminado correctamente');
      await fetchScenarios(valuationId);
    } catch (error) {
      console.error('Error deleting scenario:', error);
      showError('Error al eliminar el escenario');
      throw error;
    }
  };

  useEffect(() => {
    fetchValuations();
  }, []);

  return {
    valuations,
    scenarios,
    loading,
    fetchValuations,
    fetchScenarios,
    saveValuation,
    updateValuation,
    deleteValuation,
    saveScenario,
    deleteScenario
  };
};

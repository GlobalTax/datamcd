
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RestaurantValuation, ValuationScenario } from '@/types/restaurantValuation';
import { toast } from 'sonner';
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
      toast.error('Error al cargar las valoraciones');
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
      toast.error('Error al cargar los escenarios');
      return [];
    }
  };

  const saveValuation = async (valuation: Omit<RestaurantValuation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const typedData = await saveValuationToDB(valuation, user?.id);
      toast.success('Valoración guardada correctamente');
      await fetchValuations();
      return typedData;
    } catch (error) {
      console.error('Error saving valuation:', error);
      toast.error('Error al guardar la valoración');
      throw error;
    }
  };

  const updateValuation = async (id: string, updates: Partial<RestaurantValuation>) => {
    try {
      await updateValuationInDB(id, updates);
      toast.success('Valoración actualizada correctamente');
      await fetchValuations();
    } catch (error) {
      console.error('Error updating valuation:', error);
      toast.error('Error al actualizar la valoración');
      throw error;
    }
  };

  const deleteValuation = async (id: string) => {
    try {
      await deleteValuationFromDB(id);
      toast.success('Valoración eliminada correctamente');
      await fetchValuations();
    } catch (error) {
      console.error('Error deleting valuation:', error);
      toast.error('Error al eliminar la valoración');
      throw error;
    }
  };

  const saveScenario = async (scenario: Omit<ValuationScenario, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const typedData = await saveScenarioToDB(scenario);
      toast.success('Escenario guardado correctamente');
      await fetchScenarios(scenario.valuation_id);
      return typedData;
    } catch (error) {
      console.error('Error saving scenario:', error);
      toast.error('Error al guardar el escenario');
      throw error;
    }
  };

  const deleteScenario = async (id: string, valuationId: string) => {
    try {
      await deleteScenarioFromDB(id);
      toast.success('Escenario eliminado correctamente');
      await fetchScenarios(valuationId);
    } catch (error) {
      console.error('Error deleting scenario:', error);
      toast.error('Error al eliminar el escenario');
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

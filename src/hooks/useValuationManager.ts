import { useState, useEffect } from 'react';
import { useRestaurantValuations } from '@/hooks/useRestaurantValuations';
import { showSuccess, showError } from '@/utils/notifications';

export const useValuationManager = () => {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedRestaurantName, setSelectedRestaurantName] = useState<string>('');
  const [valuationName, setValuationName] = useState<string>('');
  const [currentValuationId, setCurrentValuationId] = useState<string | null>(null);
  
  const { 
    valuations, 
    saveValuation, 
    updateValuation, 
    deleteValuation,
    scenarios,
    saveScenario,
    deleteScenario
  } = useRestaurantValuations();

  const handleSaveValuation = async (currentData: any) => {
    if (!selectedRestaurantId) {
      showError('Por favor selecciona un restaurante');
      return;
    }

    if (!valuationName.trim()) {
      showError('Por favor ingresa un nombre para la valoración');
      return;
    }

    try {
      const valuationData = {
        restaurant_id: selectedRestaurantId,
        restaurant_name: selectedRestaurantName,
        valuation_name: valuationName,
        valuation_data: currentData
      };

      if (currentValuationId) {
        await updateValuation(currentValuationId, valuationData);
      } else {
        const result = await saveValuation(valuationData);
        setCurrentValuationId(result.id);
      }
      
      showSuccess('Valoración guardada correctamente');
    } catch (error) {
      console.error('Error saving valuation:', error);
      showError('Error al guardar la valoración');
    }
  };

  const handleLoadValuation = (valuation: any, onValuationLoaded: (data: any) => void) => {
    try {
      setSelectedRestaurantId(valuation.restaurant_id);
      setSelectedRestaurantName(valuation.restaurant_name);
      setValuationName(valuation.valuation_name);
      setCurrentValuationId(valuation.id);
      
      onValuationLoaded(valuation.valuation_data);
      showSuccess(`Valoración "${valuation.valuation_name}" cargada correctamente`);
    } catch (error) {
      console.error('Error loading valuation:', error);
      showError('Error al cargar la valoración');
    }
  };

  const getRestaurantValuations = () => {
    return valuations.filter(v => v.restaurant_id === selectedRestaurantId);
  };

  return {
    selectedRestaurantId,
    setSelectedRestaurantId,
    selectedRestaurantName,
    setSelectedRestaurantName,
    valuationName,
    setValuationName,
    currentValuationId,
    setCurrentValuationId,
    valuations,
    scenarios,
    handleSaveValuation,
    handleLoadValuation,
    getRestaurantValuations,
    deleteValuation,
    saveScenario,
    deleteScenario
  };
};

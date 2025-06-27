
import { useState } from 'react';
import { useRestaurantValuations } from '@/hooks/useRestaurantValuations';
import { toast } from 'sonner';

export const useValuationManager = () => {
  const { valuations, saveValuation, updateValuation } = useRestaurantValuations();
  
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedRestaurantName, setSelectedRestaurantName] = useState<string>('');
  const [valuationName, setValuationName] = useState<string>('');
  const [currentValuationId, setCurrentValuationId] = useState<string | null>(null);

  const handleSaveValuation = async (currentData: any) => {
    if (!selectedRestaurantId || !valuationName.trim()) {
      toast.error('Selecciona un restaurante e ingresa un nombre');
      return;
    }

    if (!currentData || !currentData.inputs) {
      toast.error('No hay datos para guardar');
      return;
    }

    try {
      const valuationData = {
        restaurant_id: selectedRestaurantId,
        restaurant_name: selectedRestaurantName,
        valuation_name: valuationName.trim(),
        valuation_date: new Date().toISOString().split('T')[0],
        change_date: currentData.inputs?.changeDate || null,
        franchise_end_date: currentData.inputs?.franchiseEndDate || null,
        remaining_years: currentData.inputs?.remainingYears || 0,
        inflation_rate: currentData.inputs?.inflationRate || 1.5,
        discount_rate: currentData.inputs?.discountRate || 21.0,
        growth_rate: currentData.inputs?.growthRate || 3.0,
        yearly_data: currentData.yearlyData || [],
        total_present_value: currentData.totalPrice || null,
        projections: currentData.projections || null
      };

      if (currentValuationId) {
        await updateValuation(currentValuationId, valuationData);
        toast.success('Valoración actualizada');
      } else {
        const newValuation = await saveValuation(valuationData);
        setCurrentValuationId(newValuation.id);
        toast.success('Valoración guardada');
      }
      
      setValuationName('');
    } catch (error) {
      console.error('Error saving valuation:', error);
      toast.error('Error al guardar la valoración');
    }
  };

  const handleLoadValuation = (valuation: any, onValuationLoaded: (valuation: any) => void) => {
    console.log('Loading valuation:', valuation);
    setCurrentValuationId(valuation.id);
    setSelectedRestaurantId(valuation.restaurant_id);
    setSelectedRestaurantName(valuation.restaurant_name);
    onValuationLoaded(valuation);
    toast.success(`Valoración "${valuation.valuation_name}" cargada`);
  };

  const getRestaurantValuations = () => {
    return selectedRestaurantId 
      ? valuations.filter(v => v.restaurant_id === selectedRestaurantId)
      : [];
  };

  return {
    selectedRestaurantId,
    setSelectedRestaurantId,
    selectedRestaurantName,
    setSelectedRestaurantName,
    valuationName,
    setValuationName,
    currentValuationId,
    handleSaveValuation,
    handleLoadValuation,
    getRestaurantValuations
  };
};

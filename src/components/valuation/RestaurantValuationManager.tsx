
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRestaurantValuations } from '@/hooks/useRestaurantValuations';
import { useFranchiseeRestaurants } from '@/hooks/useFranchiseeRestaurants';
import { RestaurantValuation, RestaurantOption } from '@/types/restaurantValuation';
import RestaurantSelector from './RestaurantSelector';
import ValuationHistory from './ValuationHistory';
import { Save, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface RestaurantValuationManagerProps {
  currentValuationData: any;
  onLoadValuation: (valuation: RestaurantValuation) => void;
  onSaveSuccess: () => void;
}

const RestaurantValuationManager = ({ 
  currentValuationData, 
  onLoadValuation, 
  onSaveSuccess 
}: RestaurantValuationManagerProps) => {
  const { restaurants, loading: restaurantsLoading } = useFranchiseeRestaurants();
  const { 
    valuations, 
    saveValuation, 
    updateValuation, 
    deleteValuation, 
    fetchValuations 
  } = useRestaurantValuations();
  
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantOption | null>(null);
  const [isNewValuationOpen, setIsNewValuationOpen] = useState(false);
  const [valuationName, setValuationName] = useState('');
  const [currentValuationId, setCurrentValuationId] = useState<string | null>(null);

  // Convertir restaurantes de franquiciado a opciones para el selector
  const restaurantOptions: RestaurantOption[] = restaurants
    .filter(r => r.base_restaurant) // Solo restaurantes con información base
    .map(r => ({
      id: r.base_restaurant!.id,
      name: r.base_restaurant!.restaurant_name,
      site_number: r.base_restaurant!.site_number
    }));

  const handleSaveValuation = async () => {
    if (!selectedRestaurant) {
      toast.error('Selecciona un restaurante primero');
      return;
    }
    
    if (!valuationName.trim()) {
      toast.error('Ingresa un nombre para la valoración');
      return;
    }

    try {
      const valuationData: Omit<RestaurantValuation, 'id' | 'created_at' | 'updated_at'> = {
        restaurant_id: selectedRestaurant.id,
        restaurant_name: selectedRestaurant.name,
        valuation_name: valuationName,
        valuation_date: new Date().toISOString().split('T')[0],
        change_date: currentValuationData.inputs?.changeDate || null,
        franchise_end_date: currentValuationData.inputs?.franchiseEndDate || null,
        remaining_years: currentValuationData.inputs?.remainingYears || 0,
        inflation_rate: currentValuationData.inputs?.inflationRate || 1.5,
        discount_rate: currentValuationData.inputs?.discountRate || 21.0,
        growth_rate: currentValuationData.inputs?.growthRate || 3.0,
        yearly_data: currentValuationData.yearlyData || [],
        total_present_value: currentValuationData.totalPrice || null,
        projections: currentValuationData.projections || null
      };

      if (currentValuationId) {
        await updateValuation(currentValuationId, valuationData);
      } else {
        const newValuation = await saveValuation(valuationData);
        setCurrentValuationId(newValuation.id);
      }
      
      setValuationName('');
      setIsNewValuationOpen(false);
      onSaveSuccess();
    } catch (error) {
      console.error('Error saving valuation:', error);
    }
  };

  const handleLoadValuation = (valuation: RestaurantValuation) => {
    setCurrentValuationId(valuation.id);
    setValuationName(valuation.valuation_name);
    setSelectedRestaurant({
      id: valuation.restaurant_id,
      name: valuation.restaurant_name,
      site_number: 'N/A' // Será actualizado cuando se seleccione
    });
    onLoadValuation(valuation);
    toast.success(`Valoración "${valuation.valuation_name}" cargada correctamente`);
  };

  const handleDuplicateValuation = (valuation: RestaurantValuation) => {
    setValuationName(`${valuation.valuation_name} - Copia`);
    setCurrentValuationId(null);
    onLoadValuation(valuation);
  };

  const handleDeleteValuation = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta valoración?')) {
      await deleteValuation(id);
      if (currentValuationId === id) {
        setCurrentValuationId(null);
        setValuationName('');
      }
    }
  };

  const handleNewValuation = () => {
    setCurrentValuationId(null);
    setValuationName('');
    setIsNewValuationOpen(true);
  };

  if (restaurantsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando restaurantes...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay restaurantes disponibles
              </h3>
              <p className="text-gray-600">
                No tienes restaurantes asignados para realizar valoraciones.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RestaurantSelector
        restaurants={restaurantOptions}
        selectedRestaurant={selectedRestaurant}
        onRestaurantChange={setSelectedRestaurant}
        loading={restaurantsLoading}
      />

      {selectedRestaurant && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Valoraciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Dialog open={isNewValuationOpen} onOpenChange={setIsNewValuationOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleNewValuation} className="flex-1">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Valoración
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Guardar Valoración</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nombre de la Valoración
                        </label>
                        <Input
                          value={valuationName}
                          onChange={(e) => setValuationName(e.target.value)}
                          placeholder="Ej: Valoración Base, Escenario Optimista..."
                        />
                      </div>
                      <Button onClick={handleSaveValuation} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Valoración
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {currentValuationId && (
                  <Button 
                    variant="outline"
                    onClick={() => setIsNewValuationOpen(true)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                )}
              </div>
              
              {currentValuationId && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">Valoración Actual:</p>
                  <p className="text-blue-700">{valuationName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <ValuationHistory
            valuations={valuations}
            selectedRestaurantId={selectedRestaurant.id}
            onLoadValuation={handleLoadValuation}
            onDeleteValuation={handleDeleteValuation}
            onDuplicateValuation={handleDuplicateValuation}
          />
        </div>
      )}
    </div>
  );
};

export default RestaurantValuationManager;

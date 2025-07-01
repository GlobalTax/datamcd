import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/notifications';

interface Restaurant {
  id: string;
  restaurant_name: string;
  site_number: string;
}

interface RestaurantAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  franchiseeId: string;
  onAssignmentComplete: () => void;
}

const RestaurantAssignmentDialog: React.FC<RestaurantAssignmentDialogProps> = ({
  isOpen,
  onOpenChange,
  franchiseeId,
  onAssignmentComplete
}) => {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('base_restaurants')
          .select('id, restaurant_name, site_number');

        if (error) {
          console.error('Error fetching restaurants:', error);
          showError('Error al cargar los restaurantes disponibles');
        }

        if (data) {
          setRestaurants(data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleAssignment = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('franchisee_restaurants')
        .insert({
          franchisee_id: franchiseeId,
          restaurant_id: selectedRestaurantId
        });

      if (error) throw error;
      
      showSuccess('Restaurante asignado correctamente');
      onAssignmentComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning restaurant:', error);
      showError('Error al asignar el restaurante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Restaurante</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Label htmlFor="restaurant">Restaurante</Label>
          <Select onValueChange={setSelectedRestaurantId}>
            <SelectTrigger id="restaurant">
              <SelectValue placeholder="Selecciona un restaurante" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.restaurant_name} ({restaurant.site_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleAssignment} disabled={loading || !selectedRestaurantId}>
          {loading ? 'Asignando...' : 'Asignar'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantAssignmentDialog;

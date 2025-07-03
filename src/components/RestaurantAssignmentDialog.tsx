
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Franchisee } from '@/types/auth';
import { BaseRestaurant } from '@/types/franchiseeRestaurant';
import { useBaseRestaurants } from '@/hooks/useBaseRestaurants';
import { useFranchisees } from '@/hooks/useFranchisees';
import { toast } from 'sonner';

interface RestaurantAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFranchisee: Franchisee | null;
}

export const RestaurantAssignmentDialog: React.FC<RestaurantAssignmentDialogProps> = ({
  isOpen,
  onClose,
  selectedFranchisee
}) => {
  const { restaurants, loading } = useBaseRestaurants();
  const { assignRestaurant } = useFranchisees();
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigning, setAssigning] = useState(false);

  const availableRestaurants = restaurants.filter(restaurant => 
    restaurant.site_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestaurantToggle = (restaurantId: string) => {
    setSelectedRestaurants(prev => 
      prev.includes(restaurantId) 
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  const handleAssign = async () => {
    if (!selectedFranchisee || selectedRestaurants.length === 0) return;

    setAssigning(true);
    try {
      let successCount = 0;
      for (const restaurantId of selectedRestaurants) {
        const success = await assignRestaurant(selectedFranchisee.id, restaurantId);
        if (success) successCount++;
      }

      if (successCount > 0) {
        toast.success(`Se asignaron ${successCount} restaurante(s) correctamente`);
        setSelectedRestaurants([]);
        onClose();
      }
    } catch (error) {
      console.error('Error assigning restaurants:', error);
      toast.error('Error al asignar restaurantes');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Asignar Restaurantes a {selectedFranchisee?.franchisee_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Buscar Restaurantes</Label>
            <Input
              id="search"
              placeholder="Buscar por número de sitio, nombre o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Seleccionar</TableHead>
                  <TableHead>Sitio</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Cargando restaurantes...
                    </TableCell>
                  </TableRow>
                ) : availableRestaurants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No se encontraron restaurantes
                    </TableCell>
                  </TableRow>
                ) : (
                  availableRestaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRestaurants.includes(restaurant.id)}
                          onCheckedChange={() => handleRestaurantToggle(restaurant.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{restaurant.site_number}</TableCell>
                      <TableCell>{restaurant.restaurant_name}</TableCell>
                      <TableCell>{restaurant.city}</TableCell>
                      <TableCell>{restaurant.restaurant_type}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {selectedRestaurants.length} restaurante(s) seleccionado(s)
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAssign}
                disabled={selectedRestaurants.length === 0 || assigning}
                className="bg-red-600 hover:bg-red-700"
              >
                {assigning ? 'Asignando...' : 'Asignar Restaurantes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

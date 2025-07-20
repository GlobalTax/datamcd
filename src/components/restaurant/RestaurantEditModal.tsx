
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, X, Building2, Euro, FileText } from 'lucide-react';
import { FranchiseeRestaurant } from '@/types/franchiseeRestaurant';

interface RestaurantEditModalProps {
  restaurant: FranchiseeRestaurant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (restaurantId: string, data: any) => Promise<boolean>;
  isUpdating: boolean;
}

const RestaurantEditModal: React.FC<RestaurantEditModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  onSave,
  isUpdating
}) => {
  const [formData, setFormData] = useState({
    monthly_rent: '',
    last_year_revenue: '',
    franchise_fee_percentage: '',
    advertising_fee_percentage: '',
    notes: ''
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        monthly_rent: restaurant.monthly_rent?.toString() || '',
        last_year_revenue: restaurant.last_year_revenue?.toString() || '',
        franchise_fee_percentage: restaurant.franchise_fee_percentage?.toString() || '4.0',
        advertising_fee_percentage: restaurant.advertising_fee_percentage?.toString() || '4.0',
        notes: restaurant.notes || ''
      });
    }
  }, [restaurant]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!restaurant) return;

    const dataToSave = {
      monthly_rent: formData.monthly_rent ? parseFloat(formData.monthly_rent) : null,
      last_year_revenue: formData.last_year_revenue ? parseFloat(formData.last_year_revenue) : null,
      franchise_fee_percentage: formData.franchise_fee_percentage ? parseFloat(formData.franchise_fee_percentage) : 4.0,
      advertising_fee_percentage: formData.advertising_fee_percentage ? parseFloat(formData.advertising_fee_percentage) : 4.0,
      notes: formData.notes
    };

    const success = await onSave(restaurant.id, dataToSave);
    if (success) {
      onClose();
    }
  };

  const formatCurrency = (value: number | undefined | null): string => {
    if (!value) return '—';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!restaurant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Editar Restaurante
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">
              {restaurant.base_restaurant?.site_number}
            </Badge>
            <span className="text-sm text-gray-600">
              {restaurant.base_restaurant?.restaurant_name}
            </span>
          </div>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Financiero
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Nombre</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                  {restaurant.base_restaurant?.restaurant_name || 'Sin nombre'}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Ciudad</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                  {restaurant.base_restaurant?.city || 'Sin ciudad'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Dirección</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                  {restaurant.base_restaurant?.address || 'Sin dirección'}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Estado</Label>
                <div className="mt-1">
                  <Badge 
                    variant="outline" 
                    className={restaurant.status === 'active' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                    }
                  >
                    {restaurant.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly_rent">Renta Mensual (€)</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  step="0.01"
                  value={formData.monthly_rent}
                  onChange={(e) => handleInputChange('monthly_rent', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="last_year_revenue">Ingresos Anuales (€)</Label>
                <Input
                  id="last_year_revenue"
                  type="number"
                  step="0.01"
                  value={formData.last_year_revenue}
                  onChange={(e) => handleInputChange('last_year_revenue', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="franchise_fee">Tarifa de Franquicia (%)</Label>
                <Input
                  id="franchise_fee"
                  type="number"
                  step="0.1"
                  value={formData.franchise_fee_percentage}
                  onChange={(e) => handleInputChange('franchise_fee_percentage', e.target.value)}
                  placeholder="4.0"
                />
              </div>
              <div>
                <Label htmlFor="advertising_fee">Tarifa de Publicidad (%)</Label>
                <Input
                  id="advertising_fee"
                  type="number"
                  step="0.1"
                  value={formData.advertising_fee_percentage}
                  onChange={(e) => handleInputChange('advertising_fee_percentage', e.target.value)}
                  placeholder="4.0"
                />
              </div>
            </div>

            {/* Mostrar valores calculados */}
            {formData.last_year_revenue && parseFloat(formData.last_year_revenue) > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Cálculos Estimados</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Tarifa Franquicia Anual:</span>
                    <div className="font-medium">
                      {formatCurrency(
                        parseFloat(formData.last_year_revenue) * 
                        (parseFloat(formData.franchise_fee_percentage) || 4.0) / 100
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Tarifa Publicidad Anual:</span>
                    <div className="font-medium">
                      {formatCurrency(
                        parseFloat(formData.last_year_revenue) * 
                        (parseFloat(formData.advertising_fee_percentage) || 4.0) / 100
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Añadir notas sobre el restaurante..."
                rows={6}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantEditModal;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ValuationBudgetFormData } from '@/types/budget';
import { Building } from 'lucide-react';

interface BasicInfoSectionProps {
  formData: ValuationBudgetFormData;
  restaurants: any[];
  onInputChange: (field: keyof ValuationBudgetFormData, value: string | number) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  restaurants,
  onInputChange
}) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Información Básica
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget_name">Nombre del Presupuesto</Label>
          <Input
            id="budget_name"
            value={formData.budget_name}
            onChange={(e) => onInputChange('budget_name', e.target.value)}
            placeholder="Ej: Presupuesto 2024 - Restaurante Centro"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="budget_year">Año del Presupuesto</Label>
          <Input
            id="budget_year"
            type="number"
            value={formData.budget_year}
            onChange={(e) => onInputChange('budget_year', parseInt(e.target.value))}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="restaurant">Restaurante - Empresa</Label>
          <Select
            value={formData.franchisee_restaurant_id}
            onValueChange={(value) => onInputChange('franchisee_restaurant_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar restaurante y empresa" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.length === 0 ? (
                <SelectItem value="no-restaurants" disabled>
                  No hay restaurantes disponibles
                </SelectItem>
              ) : (
                restaurants.map((restaurant) => {
                  const restaurantName = restaurant.base_restaurant?.restaurant_name || 'Sin nombre';
                  const siteNumber = restaurant.base_restaurant?.site_number || 'Sin número';
                  const franchiseeName = restaurant.base_restaurant?.franchisee_name || 'Sin empresa';
                  const displayText = `${restaurantName} - #${siteNumber} (${franchiseeName})`;
                  
                  return (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {displayText}
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ValuationBudgetFormData } from '@/types/budget';

interface BudgetFormProps {
  restaurants: any[];
  onSubmit: (data: ValuationBudgetFormData) => Promise<void>;
  onCancel: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  restaurants,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ValuationBudgetFormData>({
    budget_name: '',
    budget_year: new Date().getFullYear(),
    franchisee_restaurant_id: '',
    initial_sales: 0,
    sales_growth_rate: 5,
    inflation_rate: 3,
    discount_rate: 10,
    years_projection: 5,
    pac_percentage: 30,
    rent_percentage: 10,
    service_fees_percentage: 4,
    depreciation: 50000,
    interest: 10000,
    loan_payment: 20000,
    rent_index: 5000,
    miscellaneous: 8000,
    notes: ''
  });

  const handleInputChange = (field: keyof ValuationBudgetFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Nuevo Presupuesto de Valoración
        </h2>
        <p className="text-gray-600">
          Complete los datos para crear una nueva proyección financiera
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget_name">Nombre del Presupuesto</Label>
              <Input
                id="budget_name"
                value={formData.budget_name}
                onChange={(e) => handleInputChange('budget_name', e.target.value)}
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
                onChange={(e) => handleInputChange('budget_year', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="restaurant">Restaurante</Label>
              <Select
                value={formData.franchisee_restaurant_id}
                onValueChange={(value) => handleInputChange('franchisee_restaurant_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar restaurante" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.base_restaurants?.restaurant_name || 'Sin nombre'} - 
                      {restaurant.base_restaurants?.site_number || 'Sin número'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parámetros de Valoración</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initial_sales">Ventas Iniciales (€)</Label>
              <Input
                id="initial_sales"
                type="number"
                value={formData.initial_sales}
                onChange={(e) => handleInputChange('initial_sales', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="sales_growth_rate">Tasa de Crecimiento de Ventas (%)</Label>
              <Input
                id="sales_growth_rate"
                type="number"
                step="0.1"
                value={formData.sales_growth_rate}
                onChange={(e) => handleInputChange('sales_growth_rate', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="inflation_rate">Tasa de Inflación (%)</Label>
              <Input
                id="inflation_rate"
                type="number"
                step="0.1"
                value={formData.inflation_rate}
                onChange={(e) => handleInputChange('inflation_rate', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="discount_rate">Tasa de Descuento (%)</Label>
              <Input
                id="discount_rate"
                type="number"
                step="0.1"
                value={formData.discount_rate}
                onChange={(e) => handleInputChange('discount_rate', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="years_projection">Años de Proyección</Label>
              <Input
                id="years_projection"
                type="number"
                value={formData.years_projection}
                onChange={(e) => handleInputChange('years_projection', parseInt(e.target.value) || 5)}
                min="1"
                max="20"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Costos como Porcentaje de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pac_percentage">PAC (%)</Label>
              <Input
                id="pac_percentage"
                type="number"
                step="0.1"
                value={formData.pac_percentage}
                onChange={(e) => handleInputChange('pac_percentage', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="rent_percentage">Alquiler (%)</Label>
              <Input
                id="rent_percentage"
                type="number"
                step="0.1"
                value={formData.rent_percentage}
                onChange={(e) => handleInputChange('rent_percentage', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="service_fees_percentage">Tarifas de Servicio (%)</Label>
              <Input
                id="service_fees_percentage"
                type="number"
                step="0.1"
                value={formData.service_fees_percentage}
                onChange={(e) => handleInputChange('service_fees_percentage', parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Costos Fijos Anuales (€)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="depreciation">Depreciación</Label>
              <Input
                id="depreciation"
                type="number"
                value={formData.depreciation}
                onChange={(e) => handleInputChange('depreciation', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="interest">Intereses</Label>
              <Input
                id="interest"
                type="number"
                value={formData.interest}
                onChange={(e) => handleInputChange('interest', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="loan_payment">Pago de Préstamo</Label>
              <Input
                id="loan_payment"
                type="number"
                value={formData.loan_payment}
                onChange={(e) => handleInputChange('loan_payment', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="rent_index">Índice de Alquiler</Label>
              <Input
                id="rent_index"
                type="number"
                value={formData.rent_index}
                onChange={(e) => handleInputChange('rent_index', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="miscellaneous">Misceláneos</Label>
              <Input
                id="miscellaneous"
                type="number"
                value={formData.miscellaneous}
                onChange={(e) => handleInputChange('miscellaneous', parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Añade cualquier nota o comentario adicional..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Crear Presupuesto
          </Button>
        </div>
      </form>
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValuationBudgetFormData } from '@/types/budget';

interface ValuationParametersSectionProps {
  formData: ValuationBudgetFormData;
  onInputChange: (field: keyof ValuationBudgetFormData, value: string | number) => void;
}

export const ValuationParametersSection: React.FC<ValuationParametersSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
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
            onChange={(e) => onInputChange('initial_sales', parseFloat(e.target.value) || 0)}
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
            onChange={(e) => onInputChange('sales_growth_rate', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="inflation_rate">Tasa de Inflación (%)</Label>
          <Input
            id="inflation_rate"
            type="number"
            step="0.1"
            value={formData.inflation_rate}
            onChange={(e) => onInputChange('inflation_rate', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="discount_rate">Tasa de Descuento (%)</Label>
          <Input
            id="discount_rate"
            type="number"
            step="0.1"
            value={formData.discount_rate}
            onChange={(e) => onInputChange('discount_rate', parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        <div>
          <Label htmlFor="years_projection">Años de Proyección</Label>
          <Input
            id="years_projection"
            type="number"
            value={formData.years_projection}
            onChange={(e) => onInputChange('years_projection', parseInt(e.target.value) || 5)}
            min="1"
            max="20"
          />
        </div>
      </CardContent>
    </Card>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValuationBudgetFormData } from '@/types/budget';

interface FixedCostsSectionProps {
  formData: ValuationBudgetFormData;
  onInputChange: (field: keyof ValuationBudgetFormData, value: string | number) => void;
}

export const FixedCostsSection: React.FC<FixedCostsSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
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
            onChange={(e) => onInputChange('depreciation', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="interest">Intereses</Label>
          <Input
            id="interest"
            type="number"
            value={formData.interest}
            onChange={(e) => onInputChange('interest', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="loan_payment">Pago de Préstamo</Label>
          <Input
            id="loan_payment"
            type="number"
            value={formData.loan_payment}
            onChange={(e) => onInputChange('loan_payment', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="rent_index">Índice de Alquiler</Label>
          <Input
            id="rent_index"
            type="number"
            value={formData.rent_index}
            onChange={(e) => onInputChange('rent_index', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="miscellaneous">Misceláneos</Label>
          <Input
            id="miscellaneous"
            type="number"
            value={formData.miscellaneous}
            onChange={(e) => onInputChange('miscellaneous', parseFloat(e.target.value) || 0)}
          />
        </div>
      </CardContent>
    </Card>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValuationBudgetFormData } from '@/types/budget';

interface CostPercentagesSectionProps {
  formData: ValuationBudgetFormData;
  onInputChange: (field: keyof ValuationBudgetFormData, value: string | number) => void;
}

export const CostPercentagesSection: React.FC<CostPercentagesSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
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
            onChange={(e) => onInputChange('pac_percentage', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="rent_percentage">Alquiler (%)</Label>
          <Input
            id="rent_percentage"
            type="number"
            step="0.1"
            value={formData.rent_percentage}
            onChange={(e) => onInputChange('rent_percentage', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="service_fees_percentage">Tarifas de Servicio (%)</Label>
          <Input
            id="service_fees_percentage"
            type="number"
            step="0.1"
            value={formData.service_fees_percentage}
            onChange={(e) => onInputChange('service_fees_percentage', parseFloat(e.target.value) || 0)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

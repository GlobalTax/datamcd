
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfitLossFormData } from '@/types/profitLoss';

interface LaborCostsSectionProps {
  formData: ProfitLossFormData;
  totalLabor: number;
  onInputChange: (field: keyof ProfitLossFormData, value: string | number) => void;
}

export const LaborCostsSection: React.FC<LaborCostsSectionProps> = ({
  formData,
  totalLabor,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-orange-700">Costos de Mano de Obra</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="management_labor">Mano de Obra Gerencial</Label>
          <Input
            id="management_labor"
            type="number"
            step="0.01"
            value={formData.management_labor}
            onChange={(e) => onInputChange('management_labor', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="crew_labor">Mano de Obra Equipo</Label>
          <Input
            id="crew_labor"
            type="number"
            step="0.01"
            value={formData.crew_labor}
            onChange={(e) => onInputChange('crew_labor', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="benefits">Beneficios/Seguros</Label>
          <Input
            id="benefits"
            type="number"
            step="0.01"
            value={formData.benefits}
            onChange={(e) => onInputChange('benefits', e.target.value)}
          />
        </div>
        <div className="col-span-3 bg-orange-50 p-3 rounded">
          <strong>Total Mano de Obra: €{totalLabor.toLocaleString()}</strong>
        </div>
      </CardContent>
    </Card>
  );
};

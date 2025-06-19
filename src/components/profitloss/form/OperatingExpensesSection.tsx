
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfitLossFormData } from '@/types/profitLoss';

interface OperatingExpensesSectionProps {
  formData: ProfitLossFormData;
  totalOperatingExpenses: number;
  onInputChange: (field: keyof ProfitLossFormData, value: string | number) => void;
}

export const OperatingExpensesSection: React.FC<OperatingExpensesSectionProps> = ({
  formData,
  totalOperatingExpenses,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-blue-700">Gastos Operativos</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="rent">Alquiler</Label>
          <Input
            id="rent"
            type="number"
            step="0.01"
            value={formData.rent}
            onChange={(e) => onInputChange('rent', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="utilities">Servicios Públicos</Label>
          <Input
            id="utilities"
            type="number"
            step="0.01"
            value={formData.utilities}
            onChange={(e) => onInputChange('utilities', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="maintenance">Mantenimiento</Label>
          <Input
            id="maintenance"
            type="number"
            step="0.01"
            value={formData.maintenance}
            onChange={(e) => onInputChange('maintenance', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="advertising">Publicidad Local</Label>
          <Input
            id="advertising"
            type="number"
            step="0.01"
            value={formData.advertising}
            onChange={(e) => onInputChange('advertising', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="insurance">Seguros</Label>
          <Input
            id="insurance"
            type="number"
            step="0.01"
            value={formData.insurance}
            onChange={(e) => onInputChange('insurance', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="supplies">Suministros</Label>
          <Input
            id="supplies"
            type="number"
            step="0.01"
            value={formData.supplies}
            onChange={(e) => onInputChange('supplies', e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="other_expenses">Otros Gastos</Label>
          <Input
            id="other_expenses"
            type="number"
            step="0.01"
            value={formData.other_expenses}
            onChange={(e) => onInputChange('other_expenses', e.target.value)}
          />
        </div>
        <div className="col-span-3 bg-blue-50 p-3 rounded">
          <strong>Total Gastos Operativos: €{totalOperatingExpenses.toLocaleString()}</strong>
        </div>
      </CardContent>
    </Card>
  );
};

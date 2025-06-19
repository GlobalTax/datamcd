
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfitLossFormData } from '@/types/profitLoss';

interface CostOfSalesSectionProps {
  formData: ProfitLossFormData;
  totalCostOfSales: number;
  onInputChange: (field: keyof ProfitLossFormData, value: string | number) => void;
}

export const CostOfSalesSection: React.FC<CostOfSalesSectionProps> = ({
  formData,
  totalCostOfSales,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-red-700">Costo de Ventas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="food_cost">Costo Comida</Label>
          <Input
            id="food_cost"
            type="number"
            step="0.01"
            value={formData.food_cost}
            onChange={(e) => onInputChange('food_cost', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="paper_cost">Costo Papel/Envases</Label>
          <Input
            id="paper_cost"
            type="number"
            step="0.01"
            value={formData.paper_cost}
            onChange={(e) => onInputChange('paper_cost', e.target.value)}
          />
        </div>
        <div className="col-span-2 bg-red-50 p-3 rounded">
          <strong>Total Costo Ventas: €{totalCostOfSales.toLocaleString()}</strong>
        </div>
      </CardContent>
    </Card>
  );
};

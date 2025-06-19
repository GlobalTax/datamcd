
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfitLossFormData } from '@/types/profitLoss';

interface RevenueSectionProps {
  formData: ProfitLossFormData;
  totalRevenue: number;
  onInputChange: (field: keyof ProfitLossFormData, value: string | number) => void;
}

export const RevenueSection: React.FC<RevenueSectionProps> = ({
  formData,
  totalRevenue,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-green-700">Ingresos</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="net_sales">Ventas Netas</Label>
          <Input
            id="net_sales"
            type="number"
            step="0.01"
            value={formData.net_sales}
            onChange={(e) => onInputChange('net_sales', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="other_revenue">Otros Ingresos</Label>
          <Input
            id="other_revenue"
            type="number"
            step="0.01"
            value={formData.other_revenue}
            onChange={(e) => onInputChange('other_revenue', e.target.value)}
          />
        </div>
        <div className="col-span-2 bg-green-50 p-3 rounded">
          <strong>Total Ingresos: €{totalRevenue.toLocaleString()}</strong>
        </div>
      </CardContent>
    </Card>
  );
};

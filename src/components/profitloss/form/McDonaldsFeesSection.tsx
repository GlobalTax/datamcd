
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfitLossFormData } from '@/types/profitLoss';

interface McDonaldsFeesSectionProps {
  formData: ProfitLossFormData;
  totalMcDonaldsFees: number;
  onInputChange: (field: keyof ProfitLossFormData, value: string | number) => void;
}

export const McDonaldsFeesSection: React.FC<McDonaldsFeesSectionProps> = ({
  formData,
  totalMcDonaldsFees,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-yellow-700">Fees McDonald's</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="franchise_fee">Fee Franquicia</Label>
          <Input
            id="franchise_fee"
            type="number"
            step="0.01"
            value={formData.franchise_fee}
            onChange={(e) => onInputChange('franchise_fee', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="advertising_fee">Fee Publicidad</Label>
          <Input
            id="advertising_fee"
            type="number"
            step="0.01"
            value={formData.advertising_fee}
            onChange={(e) => onInputChange('advertising_fee', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="rent_percentage">% Alquiler Ventas</Label>
          <Input
            id="rent_percentage"
            type="number"
            step="0.01"
            value={formData.rent_percentage}
            onChange={(e) => onInputChange('rent_percentage', e.target.value)}
          />
        </div>
        <div className="col-span-3 bg-yellow-50 p-3 rounded">
          <strong>Total Fees McDonald's: €{totalMcDonaldsFees.toLocaleString()}</strong>
        </div>
      </CardContent>
    </Card>
  );
};

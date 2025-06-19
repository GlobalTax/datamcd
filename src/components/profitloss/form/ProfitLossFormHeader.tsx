
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ProfitLossFormData } from '@/types/profitLoss';

interface ProfitLossFormHeaderProps {
  formData: ProfitLossFormData;
  operatingIncome: number;
  onInputChange: (field: keyof ProfitLossFormData, value: string | number) => void;
}

export const ProfitLossFormHeader: React.FC<ProfitLossFormHeaderProps> = ({
  formData,
  operatingIncome,
  onInputChange
}) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="year">Año</Label>
        <Select value={formData.year.toString()} onValueChange={(value) => onInputChange('year', parseInt(value))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="month">Mes</Label>
        <Select value={formData.month.toString()} onValueChange={(value) => onInputChange('month', parseInt(value))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthNames.map((month, index) => (
              <SelectItem key={index + 1} value={(index + 1).toString()}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-end">
        <Card className="w-full">
          <CardContent className="p-3">
            <div className="text-sm text-gray-600">Beneficio Operativo</div>
            <div className={`text-lg font-bold ${operatingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{operatingIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

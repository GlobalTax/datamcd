
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

interface FormSummaryProps {
  totalRevenue: number;
  grossProfit: number;
  operatingIncome: number;
}

export const FormSummary: React.FC<FormSummaryProps> = ({
  totalRevenue,
  grossProfit,
  operatingIncome
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Resumen Calculado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Ingresos Totales:</span>
              <span className="font-semibold">€{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Beneficio Bruto:</span>
              <span className="font-semibold">€{grossProfit.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Margen Bruto:</span>
              <span className="font-semibold">
                {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className={operatingIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                Beneficio Operativo:
              </span>
              <span className={`font-bold ${operatingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{operatingIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

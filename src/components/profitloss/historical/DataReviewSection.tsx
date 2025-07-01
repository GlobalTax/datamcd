
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { YearlyData, validateYearlyData } from './utils';
import { useProfitLossCalculations } from '@/hooks/useProfitLossCalculations';

interface DataReviewSectionProps {
  data: YearlyData[];
  onRemoveYear: (index: number) => void;
  onProceedToImport: () => void;
  onBack: () => void;
}

export const DataReviewSection: React.FC<DataReviewSectionProps> = ({
  data,
  onRemoveYear,
  onProceedToImport,
  onBack
}) => {
  const { formatCurrency } = useProfitLossCalculations();

  const validData = data.filter(validateYearlyData);
  const invalidData = data.filter(item => !validateYearlyData(item));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Revisión de Datos Importados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Total de registros: {data.length}</p>
                <p className="text-sm text-gray-600">
                  Válidos: {validData.length} | Inválidos: {invalidData.length}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onBack}>
                  Volver
                </Button>
                <Button 
                  onClick={onProceedToImport}
                  disabled={validData.length === 0}
                >
                  Importar Datos Válidos
                </Button>
              </div>
            </div>

            {invalidData.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="font-medium text-red-700">Datos Inválidos Encontrados</p>
                </div>
                <p className="text-sm text-red-600">
                  {invalidData.length} registros no pasaron la validación y serán omitidos.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-medium">Datos a Importar:</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {validData.map((yearData, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">Año {yearData.year}</Badge>
                        <span className="text-sm">
                          Ventas: {formatCurrency(yearData.net_sales)}
                        </span>
                        <span className="text-sm">
                          Costes: {formatCurrency(yearData.food_cost + yearData.paper_cost)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveYear(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

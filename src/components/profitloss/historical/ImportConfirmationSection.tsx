
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Save } from 'lucide-react';
import { YearlyData } from './types';

interface ImportConfirmationSectionProps {
  yearlyDataList: YearlyData[];
  importing: boolean;
  progress: number;
  onBack: () => void;
  onImport: () => void;
}

export const ImportConfirmationSection: React.FC<ImportConfirmationSectionProps> = ({
  yearlyDataList,
  importing,
  progress,
  onBack,
  onImport
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Confirmar Importación</h2>
        <p className="text-gray-600">
          Se van a importar {yearlyDataList.length} años de datos ({yearlyDataList.length * 12} registros mensuales)
        </p>
      </div>

      <div className="space-y-4">
        {yearlyDataList.map((yearData, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded">
            <div>
              <div className="font-semibold">Año {yearData.year}</div>
              <div className="text-sm text-gray-600">
                Ventas: €{yearData.net_sales.toLocaleString()} | 
                Costos: €{(yearData.food_cost + yearData.paper_cost).toLocaleString()}
              </div>
            </div>
            <Badge variant="outline">12 meses</Badge>
          </div>
        ))}
      </div>

      {importing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Importando datos...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          Volver a Revisar
        </Button>
        <Button 
          onClick={onImport}
          disabled={importing}
        >
          <Save className="w-4 h-4 mr-2" />
          {importing ? 'Importando...' : 'Importar Datos'}
        </Button>
      </div>
    </div>
  );
};

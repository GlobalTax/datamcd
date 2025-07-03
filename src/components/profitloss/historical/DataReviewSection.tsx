
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { YearlyData, ImportMethod } from './types';
import { createEmptyYearlyData } from './utils';

interface DataReviewSectionProps {
  yearlyDataList: YearlyData[];
  importMethod: ImportMethod;
  onUpdateYearlyData: (index: number, field: keyof YearlyData, value: number | string) => void;
  onAddYear: () => void;
  onRemoveYear: (index: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const DataReviewSection: React.FC<DataReviewSectionProps> = ({
  yearlyDataList,
  importMethod,
  onUpdateYearlyData,
  onAddYear,
  onRemoveYear,
  onBack,
  onContinue
}) => {
  const getImportMethodLabel = () => {
    switch (importMethod) {
      case 'file': return 'Archivo';
      case 'csv': return 'Excel Copiado';
      case 'manual': return 'Manual';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Revisar Datos Históricos</h2>
          <p className="text-gray-600">
            Verifica y ajusta los datos antes de importar ({getImportMethodLabel()})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onAddYear}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Año
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {yearlyDataList.map((yearData, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Año {yearData.year}</CardTitle>
                {yearlyDataList.length > 1 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onRemoveYear(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Año</Label>
                  <Input
                    type="number"
                    value={yearData.year}
                    onChange={(e) => onUpdateYearlyData(index, 'year', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Ventas Netas (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={yearData.net_sales}
                    onChange={(e) => onUpdateYearlyData(index, 'net_sales', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Costo Comida (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={yearData.food_cost}
                    onChange={(e) => onUpdateYearlyData(index, 'food_cost', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Papel (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={yearData.paper_cost}
                    onChange={(e) => onUpdateYearlyData(index, 'paper_cost', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Mano de Obra (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={yearData.crew_labor}
                    onChange={(e) => onUpdateYearlyData(index, 'crew_labor', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Gerencia (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={yearData.management_labor}
                    onChange={(e) => onUpdateYearlyData(index, 'management_labor', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Publicidad (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={yearData.advertising}
                    onChange={(e) => onUpdateYearlyData(index, 'advertising', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Renta (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={yearData.rent}
                    onChange={(e) => onUpdateYearlyData(index, 'rent', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Total Costo Comida:</span>
                    <span className="font-semibold">
                      €{(yearData.food_cost + yearData.food_employees + yearData.waste).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>% sobre Ventas:</span>
                    <span className="font-semibold">
                      {yearData.net_sales > 0 ? (((yearData.food_cost + yearData.food_employees + yearData.waste) / yearData.net_sales) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button 
          onClick={onContinue}
          disabled={yearlyDataList.length === 0}
        >
          Continuar a Importación
        </Button>
      </div>
    </div>
  );
};

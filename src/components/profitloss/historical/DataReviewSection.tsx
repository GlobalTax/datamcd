
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Edit, Trash2 } from 'lucide-react';
import { YearlyData } from './utils';

interface DataReviewSectionProps {
  data: YearlyData[];
  onEdit: (yearIndex: number, monthIndex: number) => void;
  onDelete: (yearIndex: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DataReviewSection: React.FC<DataReviewSectionProps> = ({
  data,
  onEdit,
  onDelete,
  onConfirm,
  onCancel
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Revisar Datos a Importar</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            <Check className="w-4 h-4 mr-2" />
            Confirmar Importación
          </Button>
        </div>
      </div>

      {data.map((yearData, yearIndex) => (
        <Card key={yearData.year}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Año {yearData.year}
                <Badge variant="secondary">
                  {yearData.data.filter(m => m.net_sales > 0).length} meses con datos
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(yearIndex)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yearData.data.map((monthData, monthIndex) => (
                <div key={monthIndex} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{monthNames[monthIndex]}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(yearIndex, monthIndex)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Ventas:</span>
                      <span>{formatCurrency(monthData.net_sales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comida:</span>
                      <span>{formatCurrency(monthData.food_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mano de obra:</span>
                      <span>{formatCurrency(monthData.crew_labor)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

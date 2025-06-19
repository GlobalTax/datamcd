
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileSpreadsheet, Upload, Info } from 'lucide-react';
import { parseDetailedDataFromText } from './detailedUtils';
import { YearlyData, ImportMethod } from './types';
import { toast } from 'sonner';

interface DetailedCopyPasteCardProps {
  onDataParsed: (data: YearlyData[], method: ImportMethod) => void;
}

export const DetailedCopyPasteCard: React.FC<DetailedCopyPasteCardProps> = ({ onDataParsed }) => {
  const [csvData, setCsvData] = useState('');

  const parseDetailedData = () => {
    console.log('=== DETAILED COPY PASTE DEBUG ===');
    console.log('CSV data length:', csvData.length);
    console.log('First 300 chars:', csvData.substring(0, 300));
    
    try {
      const data = parseDetailedDataFromText(csvData);
      console.log('Parsed detailed data successfully:', data.length, 'years');
      console.log('Sample data:', data[0]);
      onDataParsed(data, 'detailed');
      toast.success(`${data.length} años de datos detallados procesados correctamente`);
    } catch (error) {
      console.error('Error parsing detailed data:', error);
      toast.error('Error al procesar los datos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          Datos P&L Detallados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Para datos P&L completos y detallados</p>
            <p>Incluye todas las subcategorías: Comida Empleados, Desperdicios, Seguridad Social, etc.</p>
          </div>
        </div>
        
        <Textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Pega aquí los datos de P&L detallados (formato de tabla con años como columnas)..."
          className="min-h-[150px] font-mono text-xs"
        />

        <div className="text-xs text-gray-500">
          <p><strong>Formato esperado:</strong></p>
          <div className="mt-1 p-2 bg-gray-50 rounded font-mono text-xs">
            Concepto&nbsp;&nbsp;&nbsp;&nbsp;Ejerc.2023&nbsp;&nbsp;&nbsp;Ejerc.2022&nbsp;&nbsp;&nbsp;...<br/>
            Ventas Netas&nbsp;&nbsp;&nbsp;3.273.161,04&nbsp;&nbsp;&nbsp;2.966.623,82<br/>
            Comida&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;834.777,71&nbsp;&nbsp;&nbsp;&nbsp;730.579,60
          </div>
        </div>

        <Button 
          onClick={parseDetailedData}
          disabled={!csvData.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Procesar Datos Detallados
        </Button>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { parseDataFromText } from './utils';
import { YearlyData } from './types';
import { toast } from 'sonner';

interface CopyPasteCardProps {
  onDataParsed: (data: YearlyData[]) => void;
}

export const CopyPasteCard: React.FC<CopyPasteCardProps> = ({ onDataParsed }) => {
  const [csvData, setCsvData] = useState('');

  const parseCSVData = () => {
    try {
      const data = parseDataFromText(csvData);
      onDataParsed(data);
    } catch (error) {
      toast.error('Error al procesar los datos');
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Copiar desde Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Copia datos directamente desde Excel y pégalos aquí
        </p>
        
        <Textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Pega aquí los datos copiados desde Excel..."
          className="min-h-[120px] font-mono text-xs"
        />

        <div className="text-xs text-gray-500">
          <p><strong>Cómo copiar desde Excel:</strong></p>
          <ol className="list-decimal list-inside mt-1">
            <li>Selecciona los datos en Excel</li>
            <li>Ctrl+C para copiar</li>
            <li>Pega aquí (Ctrl+V)</li>
          </ol>
        </div>

        <Button 
          onClick={parseCSVData}
          disabled={!csvData.trim()}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Procesar Datos
        </Button>
      </CardContent>
    </Card>
  );
};

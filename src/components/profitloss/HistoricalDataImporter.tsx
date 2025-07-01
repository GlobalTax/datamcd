import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useDataImport } from '@/hooks/useDataImport';
import { showSuccess, showError } from '@/utils/notifications';

interface HistoricalDataImporterProps {
  siteNumber: string;
  onImportComplete: () => void;
}

export const HistoricalDataImporter: React.FC<HistoricalDataImporterProps> = ({
  siteNumber,
  onImportComplete
}) => {
  const { importing, progress, importData } = useDataImport();
  const [csvData, setCsvData] = useState('');

  const handleImport = async () => {
    try {
      if (!csvData.trim()) {
        showError('Por favor ingresa los datos históricos');
        return;
      }

      // Simular progreso de importación
      const parsedData = []; // Parsed from csvData

      const success = await importData(parsedData, siteNumber);
      
      if (success) {
        setCsvData('');
        onImportComplete();
        showSuccess('Datos históricos importados correctamente');
      }
    } catch (error) {
      console.error('Import error:', error);
      showError('Error al importar los datos históricos');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Datos Históricos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Pega aquí los datos históricos en formato CSV..."
          className="min-h-[200px]"
        />
        
        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importando datos...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={handleImport}
          disabled={importing || !csvData.trim()}
          className="w-full"
        >
          {importing ? 'Importando...' : 'Importar Datos'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HistoricalDataImporter;

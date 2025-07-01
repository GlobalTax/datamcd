import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useDataImport } from '@/hooks/useDataImport';
import { showSuccess, showError } from '@/utils/notifications';

interface DataImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

const DataImportDialog: React.FC<DataImportDialogProps> = ({
  isOpen,
  onOpenChange,
  onImportComplete
}) => {
  const { importing, progress, importData, validateData } = useDataImport();
  const [csvData, setCsvData] = useState('');

  const handleImport = async () => {
    try {
      if (!csvData.trim()) {
        showError('Por favor ingresa los datos a importar');
        return;
      }

      const parsedData = csvData.split('\n').map(line => {
        const values = line.split(',');
        return {
          year: parseInt(values[0]),
          month: parseInt(values[1]),
          net_sales: parseFloat(values[2]),
          food_cost: parseFloat(values[3]),
          paper_cost: parseFloat(values[4]),
          crew_labor: parseFloat(values[5]),
          management_labor: parseFloat(values[6]),
          other_expenses: parseFloat(values[7] || '0')
        };
      });

      const validatedData = validateData(parsedData);
      const success = await importData(validatedData, 'default');

      if (success) {
        showSuccess('Datos importados correctamente');
        onImportComplete();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      showError('Error durante la importación');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Datos</DialogTitle>
        </DialogHeader>
        <Textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Pega aquí los datos en formato CSV..."
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
        <Button onClick={handleImport} disabled={importing}>
          {importing ? 'Importando...' : 'Importar'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DataImportDialog;

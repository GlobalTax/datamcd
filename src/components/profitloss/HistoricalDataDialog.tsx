
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Database } from 'lucide-react';
import { HistoricalDataImporter } from './HistoricalDataImporter';

interface HistoricalDataDialogProps {
  restaurantId: string;
}

export const HistoricalDataDialog: React.FC<HistoricalDataDialogProps> = ({ restaurantId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          Datos Históricos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar Datos Históricos P&L
          </DialogTitle>
        </DialogHeader>
        
        <HistoricalDataImporter 
          siteNumber={restaurantId}
          onImportComplete={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

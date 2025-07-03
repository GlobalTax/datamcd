
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useDataImport } from '@/hooks/useDataImport';
import { toast } from 'sonner';

interface DataImportDialogProps {
  onImportComplete: () => void;
}

export const DataImportDialog: React.FC<DataImportDialogProps> = ({ onImportComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const { importing, progress, importRestaurantsData } = useDataImport();

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast.error('Por favor, ingresa los datos para importar');
      return;
    }

    try {
      // Parsear datos CSV (asumiendo que están separados por tabulaciones)
      const lines = csvData.trim().split('\n');
      const data = lines.map(line => {
        const columns = line.split('\t');
        return {
          site: columns[0] || '',
          nombre: columns[1] || '',
          estado: columns[2] || '',
          tipoInmueble: columns[3] || '',
          direccion: columns[4] || '',
          telRestaurante: columns[5] || '',
          municipio: columns[6] || '',
          provincia: columns[7] || '',
          comAutonoma: columns[8] || '',
          franquiciado: columns[9] || '',
          telfFranquiciado: columns[10] || '',
          fechaApertura: columns[11] || '',
          mailFranquiciado: columns[12] || '',
          nifSociedad: columns[13] || ''
        };
      });

      await importRestaurantsData(data);
      setIsOpen(false);
      setCsvData('');
      onImportComplete();
    } catch (error) {
      console.error('Error parsing data:', error);
      toast.error('Error al procesar los datos');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Importar Datos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar Datos de Restaurantes
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Pega los datos de Excel/CSV aquí (separados por tabulaciones):
            </label>
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="SITE	NOMBRE	ESTADO	TIPO INMUEBLE	DIRECCIÓN	TEL RESTAURANTE	MUNICIPIO	PROVINCIA	COM. AUTONOMA	FRANQUICIADO	TELF. FRANQUICIADO	FECHA APERTURA	MAIL FRANQUICIADO	NIF SOCIEDAD"
              className="min-h-[200px] font-mono text-xs"
              disabled={importing}
            />
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

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={importing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={importing || !csvData.trim()}
            >
              {importing ? 'Importando...' : 'Importar Datos'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

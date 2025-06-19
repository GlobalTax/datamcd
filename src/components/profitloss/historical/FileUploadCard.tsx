
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { File, Download } from 'lucide-react';
import { parseDataFromText, downloadTemplate } from './utils';
import { YearlyData } from './types';
import { toast } from 'sonner';

interface FileUploadCardProps {
  onDataParsed: (data: YearlyData[]) => void;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({ onDataParsed }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      // Detectar el separador automáticamente
      let separator = '\t';
      if (text.includes(',') && !text.includes('\t')) {
        separator = ',';
      } else if (text.includes(';')) {
        separator = ';';
      }

      try {
        const data = parseDataFromText(text, separator);
        onDataParsed(data);
        toast.success(`Archivo cargado correctamente. Detectado separador: "${separator}"`);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Error al leer el archivo. Verifica el formato.');
      }
    };

    if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      toast.error('Por favor, sube un archivo .csv, .txt o copia los datos directamente.');
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="w-5 h-5" />
          Subir Archivo Excel/CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Sube un archivo .csv, .txt o Excel guardado como CSV
        </p>
        
        <div className="space-y-3">
          <Input
            type="file"
            accept=".csv,.txt,.tsv"
            onChange={handleFileUpload}
            className="w-full"
          />
          
          <div className="text-xs text-gray-500">
            <p><strong>Formatos soportados:</strong></p>
            <ul className="list-disc list-inside mt-1">
              <li>CSV con comas (,)</li>
              <li>CSV con tabulaciones (TSV)</li>
              <li>CSV con punto y coma (;)</li>
              <li>Archivos de texto separados</li>
            </ul>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={downloadTemplate}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar Plantilla
        </Button>
      </CardContent>
    </Card>
  );
};

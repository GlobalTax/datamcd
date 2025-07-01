
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { YearlyData, parseDataFromText, downloadTemplate } from './utils';

interface FileUploadCardProps {
  onDataParsed: (data: YearlyData[]) => void;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({ onDataParsed }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const text = await file.text();
      const parsedData = parseDataFromText(text);
      
      if (parsedData.length === 0) {
        setError('No se pudieron procesar los datos del archivo. Verifica el formato.');
        return;
      }

      onDataParsed(parsedData);
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Error al procesar el archivo. Verifica que sea un archivo válido.');
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Archivo CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Sube un archivo CSV con los datos históricos de P&L.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Plantilla
            </Button>
            <span className="text-xs text-gray-500">
              Usa la plantilla para formatear tus datos correctamente
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Arrastra tu archivo CSV aquí</p>
            <p className="text-xs text-gray-500">o haz clic para seleccionar</p>
          </div>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {uploading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Procesando archivo...</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>Formato esperado:</strong></p>
          <p>Año, Ventas Netas, Coste Comida, Coste Papel, Mano de Obra, ...</p>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { CreateIncidentData } from "@/types/incident";

interface IncidentExcelManagerProps {
  onImport: (incidents: CreateIncidentData[]) => void;
  incidents: any[];
}

export const IncidentExcelManager = ({ onImport, incidents }: IncidentExcelManagerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Mapear datos del Excel a nuestro formato
          const mappedIncidents: CreateIncidentData[] = jsonData.map((row: any) => ({
            title: row['INCIDENT'] || row['TÍTULO'] || 'Sin título',
            description: row['DESCRIPTION'] || row['DESCRIPCIÓN'] || '',
            incident_type: mapExcelType(row['CLASSIFICATION'] || row['CLASIFICACIÓN']),
            priority: mapExcelPriority(row['PRIORITY'] || row['PRIORIDAD']),
            restaurant_id: '', // Necesitará mapeo manual
            nombre: row['NAME'] || row['NOMBRE'] || '',
            naves: row['NAVES'] || '',
            ingeniero: row['ENGINEER'] || row['INGENIERO'] || '',
            clasificacion: row['CLASSIFICATION'] || row['CLASIFICACIÓN'] || '',
            participante: row['PARTICIPANT'] || row['PARTICIPANTE'] || '',
            periodo: row['PERIOD'] || row['PERIODO'] || '',
            importe_carto: parseFloat(row['IMPORTE CARTO'] || row['IMPORTE_CARTO'] || '0'),
            documento_url: row['DOCUMENTO'] || row['DOCUMENT'] || '',
          }));

          onImport(mappedIncidents);
          toast({
            title: "Importación exitosa",
            description: `Se importaron ${mappedIncidents.length} incidencias del Excel.`,
          });
        } catch (error) {
          console.error('Error procesando Excel:', error);
          toast({
            title: "Error de importación",
            description: "No se pudo procesar el archivo Excel.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "No se pudo leer el archivo.",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    try {
      // Mapear datos a formato Excel
      const excelData = incidents.map(incident => ({
        'NOMBRE': incident.nombre || '',
        'FRANQUICIADO': incident.restaurant?.base_restaurant?.restaurant_name || '',
        'NAVES': incident.naves || '',
        'ADDRESS': incident.restaurant?.base_restaurant?.address || '',
        'INGENIERO': incident.ingeniero || '',
        'FECHA ALTA': new Date(incident.created_at).toLocaleDateString('es-ES'),
        'INCIDENT': incident.title,
        'CLASIFICACIÓN': incident.clasificacion || incident.incident_type,
        'DESCRIPCIÓN': incident.description || '',
        'ESTADO': getStatusSpanish(incident.status),
        'PARTICIPANTE': incident.participante || '',
        'FECHA CIERRE': incident.fecha_cierre ? new Date(incident.fecha_cierre).toLocaleDateString('es-ES') : '',
        'COMENTARIOS': incident.resolution_notes || '',
        'PERIODO': incident.periodo || '',
        'IMPORTE CARTO': incident.importe_carto || 0,
        'DOCUMENTO': incident.documento_url || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidencias');

      // Descargar archivo
      const fileName = `incidencias_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Exportación exitosa",
        description: `Se descargó el archivo ${fileName}.`,
      });
    } catch (error) {
      toast({
        title: "Error de exportación",
        description: "No se pudo exportar a Excel.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Gestión de Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="excel-upload">Importar desde Excel</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
            <Button size="sm" disabled={isProcessing}>
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? "Procesando..." : "Subir"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Sube un archivo Excel con la estructura de columnas estándar.
          </p>
        </div>

        <div>
          <Button onClick={exportToExcel} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Exportar a Excel
          </Button>
          <p className="text-sm text-muted-foreground mt-1">
            Descarga todas las incidencias en formato Excel.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Funciones de mapeo
const mapExcelType = (excelType: string): any => {
  const type = excelType?.toLowerCase();
  if (type?.includes('climatiz')) return 'climatizacion';
  if (type?.includes('electric')) return 'electricidad';
  if (type?.includes('fontaner') || type?.includes('plumb')) return 'fontaneria';
  if (type?.includes('mantenim') || type?.includes('maintenance')) return 'mantenimiento';
  if (type?.includes('obra') || type?.includes('construc')) return 'obras';
  if (type?.includes('limpie') || type?.includes('clean')) return 'limpieza';
  if (type?.includes('segur') || type?.includes('safety')) return 'safety';
  if (type?.includes('equip')) return 'equipment';
  return 'general';
};

const mapExcelPriority = (excelPriority: string): any => {
  const priority = excelPriority?.toLowerCase();
  if (priority?.includes('crítica') || priority?.includes('critical')) return 'critical';
  if (priority?.includes('alta') || priority?.includes('high')) return 'high';
  if (priority?.includes('media') || priority?.includes('medium')) return 'medium';
  return 'low';
};

const getStatusSpanish = (status: string): string => {
  switch (status) {
    case 'open': return 'Abierta';
    case 'in_progress': return 'En Progreso';
    case 'resolved': return 'Resuelta';
    case 'closed': return 'Cerrada';
    case 'pending': return 'Pendiente';
    case 'cancelled': return 'Cancelada';
    default: return status;
  }
};
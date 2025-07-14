import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrquestMeasure, OrquestMeasureType } from '@/types/orquest';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download } from 'lucide-react';

interface ServicioOrquest {
  id: string;
  nombre?: string;
  datos_completos?: any;
}

interface OrquestMeasuresTableProps {
  measures: OrquestMeasure[];
  measureTypes: OrquestMeasureType[];
  services: ServicioOrquest[];
  loading: boolean;
  onSyncFromOrquest: () => void;
  selectedServiceId: string;
  setSelectedServiceId: (value: string) => void;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
}

export const OrquestMeasuresTable: React.FC<OrquestMeasuresTableProps> = ({
  measures,
  measureTypes,
  services,
  loading,
  onSyncFromOrquest,
  selectedServiceId,
  setSelectedServiceId,
  selectedDate,
  setSelectedDate
}) => {
  const formatMeasureValue = (value: number, measureType: string) => {
    const typeInfo = measureTypes.find(mt => mt.measure_type === measureType);
    const unit = typeInfo?.unit;
    
    if (unit === 'EUR') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    }
    if (unit === 'PERCENTAGE') {
      return `${value.toFixed(2)}%`;
    }
    if (unit === 'HOURS') {
      return `${value.toFixed(1)}h`;
    }
    if (unit === 'SCORE') {
      return `${value.toFixed(1)} pts`;
    }
    return value.toFixed(2);
  };

  const getMeasureDisplayName = (measureType: string) => {
    const typeInfo = measureTypes.find(mt => mt.measure_type === measureType);
    return typeInfo?.display_name || measureType;
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'real':
        return <Badge variant="default" className="bg-green-500">Real</Badge>;
      case 'forecast':
        return <Badge variant="secondary" className="bg-blue-500">Previsión</Badge>;
      case 'projection':
        return <Badge variant="outline" className="bg-purple-500">Proyección</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const filteredMeasures = measures.filter(measure => {
    if (selectedServiceId && measure.service_id !== selectedServiceId) return false;
    if (selectedDate) {
      const measureDate = new Date(measure.from_time).toISOString().split('T')[0];
      if (measureDate !== selectedDate) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="service-select">Servicio</Label>
          <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
            <SelectTrigger id="service-select">
              <SelectValue placeholder="Seleccionar servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los servicios</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.nombre || service.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-input">Fecha</Label>
          <Input
            id="date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>&nbsp;</Label>
          <Button 
            onClick={onSyncFromOrquest}
            disabled={loading || !selectedServiceId || !selectedDate}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Sincronizar desde Orquest
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Servicio</TableHead>
              <TableHead>Tipo de Medida</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Actualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMeasures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {measures.length === 0 
                    ? "No hay medidas sincronizadas aún" 
                    : "No hay medidas que coincidan con los filtros seleccionados"
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredMeasures.map((measure) => (
                <TableRow key={measure.id}>
                  <TableCell className="font-medium">
                    {services.find(s => s.id === measure.service_id)?.nombre || measure.service_id}
                  </TableCell>
                  <TableCell>
                    {getMeasureDisplayName(measure.measure_type)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatMeasureValue(measure.value, measure.measure_type)}
                  </TableCell>
                  <TableCell>
                    {getCategoryBadge(measure.measure_category || 'real')}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {format(new Date(measure.from_time), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </div>
                      <div className="text-muted-foreground">
                        hasta {format(new Date(measure.to_time), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {measure.updated_at && format(new Date(measure.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
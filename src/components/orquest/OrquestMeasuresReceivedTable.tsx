import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrquestMeasureReceived } from '@/hooks/useOrquestMeasuresReceived';

interface OrquestMeasuresReceivedTableProps {
  measures: OrquestMeasureReceived[];
  loading?: boolean;
}

const getMeasureTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'SALES': 'Ventas',
    'TICKETS': 'Tickets',
    'FOOTFALL': 'Afluencia',
    'LABOR_COST': 'Coste Laboral',
    'FOOD_COST': 'Coste Alimentario'
  };
  return labels[type] || type;
};

const getMeasureTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'SALES': 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    'TICKETS': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'FOOTFALL': 'bg-purple-500/10 text-purple-700 border-purple-200',
    'LABOR_COST': 'bg-orange-500/10 text-orange-700 border-orange-200',
    'FOOD_COST': 'bg-red-500/10 text-red-700 border-red-200'
  };
  return colors[type] || 'bg-gray-500/10 text-gray-700 border-gray-200';
};

export const OrquestMeasuresReceivedTable: React.FC<OrquestMeasuresReceivedTableProps> = ({
  measures,
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medidas Recibidas de Orquest</CardTitle>
          <CardDescription>
            Medidas reales obtenidas desde Orquest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (measures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medidas Recibidas de Orquest</CardTitle>
          <CardDescription>
            Medidas reales obtenidas desde Orquest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay medidas recibidas disponibles.
            Utiliza el botón "Obtener Medidas" para sincronizar con Orquest.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medidas Recibidas de Orquest</CardTitle>
        <CardDescription>
          {measures.length} medida{measures.length !== 1 ? 's' : ''} real{measures.length !== 1 ? 'es' : ''} obtenida{measures.length !== 1 ? 's' : ''} desde Orquest
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Tipo de Medida</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Recibido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measures.map((measure) => (
                <TableRow key={measure.id}>
                  <TableCell className="font-medium">
                    {measure.service_id}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getMeasureTypeColor(measure.measure_type)}
                    >
                      {getMeasureTypeLabel(measure.measure_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {typeof measure.value === 'number' 
                      ? measure.value.toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: measure.value % 1 === 0 ? 0 : 2
                        })
                      : measure.value
                    }
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>
                      <div>
                        {format(new Date(measure.from_time), 'dd MMM yyyy', { locale: es })}
                      </div>
                      <div>
                        {format(new Date(measure.to_time), 'dd MMM yyyy', { locale: es })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {measure.measure_category === 'real' ? 'Real' : 
                       measure.measure_category === 'forecast' ? 'Proyección' : 
                       measure.measure_category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(measure.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
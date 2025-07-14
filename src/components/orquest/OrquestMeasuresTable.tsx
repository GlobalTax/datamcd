import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OrquestMeasureSent } from '@/hooks/useOrquestMeasures';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrquestMeasuresTableProps {
  measures: OrquestMeasureSent[];
  loading: boolean;
}

export const OrquestMeasuresTable: React.FC<OrquestMeasuresTableProps> = ({
  measures,
  loading
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-500">Enviado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Error</Badge>;
      case 'confirmed':
        return <Badge variant="secondary" className="bg-blue-500">Confirmado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMeasureTypeLabel = (type: string) => {
    switch (type) {
      case 'SALES':
        return 'Ventas';
      case 'LABOR_COST':
        return 'Costos de Personal';
      case 'FOOD_COST':
        return 'Costos de Comida';
      case 'OPERATING_EXPENSES':
        return 'Gastos Operativos';
      case 'NET_PROFIT':
        return 'Beneficio Neto';
      default:
        return type;
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

  if (!measures.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se han enviado medidas a Orquest aún
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Servicio</TableHead>
            <TableHead>Tipo de Medida</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Enviado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {measures.map((measure) => (
            <TableRow key={measure.id}>
              <TableCell className="font-medium">
                {measure.service_id}
              </TableCell>
              <TableCell>
                {getMeasureTypeLabel(measure.measure_type)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(measure.value)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>
                    {format(new Date(measure.period_from), 'dd/MM/yyyy', { locale: es })}
                  </div>
                  <div className="text-muted-foreground">
                    hasta {format(new Date(measure.period_to), 'dd/MM/yyyy', { locale: es })}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(measure.status)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {format(new Date(measure.sent_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
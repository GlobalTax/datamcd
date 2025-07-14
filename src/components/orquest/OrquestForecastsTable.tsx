import React from 'react';
import { useOrquestForecasts } from '@/hooks/useOrquestForecasts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const OrquestForecastsTable: React.FC = () => {
  const { forecasts, isLoading } = useOrquestForecasts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Forecasts Enviados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Cargando forecasts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Forecasts Enviados ({forecasts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {forecasts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No se han enviado forecasts aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead>Forecasts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts.map((forecast) => (
                  <TableRow key={forecast.id}>
                    <TableCell className="font-medium">
                      {forecast.service_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {forecast.forecast_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(forecast.period_from), 'MMM yyyy', { locale: es })} - {format(new Date(forecast.period_to), 'MMM yyyy', { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={forecast.status === 'sent' ? 'default' : 'destructive'}>
                        {forecast.status === 'sent' ? 'Enviado' : 'Error'}
                      </Badge>
                      {forecast.error_message && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {forecast.error_message.substring(0, 50)}...
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(forecast.sent_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {Array.isArray(forecast.forecast_data) ? forecast.forecast_data.length : 1} forecasts
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
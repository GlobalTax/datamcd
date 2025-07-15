import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotateCcw, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useQuantumIntegration } from '@/hooks/useQuantumIntegration';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function QuantumSyncStatus() {
  const { effectiveFranchisee } = useUnifiedAuth();
  const {
    syncStats,
    lastSync,
    isSyncing,
    syncQuantumData,
    error
  } = useQuantumIntegration(effectiveFranchisee?.id);

  const handleManualSync = async () => {
    if (!effectiveFranchisee?.id) return;

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    await syncQuantumData({
      franchisee_id: effectiveFranchisee.id,
      period_start: firstDayOfMonth.toISOString().split('T')[0],
      period_end: lastDayOfMonth.toISOString().split('T')[0],
      sync_type: 'manual'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <RotateCcw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!effectiveFranchisee) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Estado Sincronización Quantum
            </CardTitle>
            <CardDescription>
              Integración automática con Quantum Economics
            </CardDescription>
          </div>
          <Button
            onClick={handleManualSync}
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            {isSyncing ? (
              <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Sincronizar Ahora
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error en la sincronización: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Estado de la última sincronización */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Última Sincronización</h4>
          {lastSync ? (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                {getStatusIcon(lastSync.status)}
                <div>
                  <p className="text-sm font-medium">
                    {lastSync.sync_completed_at
                      ? format(new Date(lastSync.sync_completed_at), 'PPpp', { locale: es })
                      : 'En proceso...'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lastSync.records_imported} registros importados de {lastSync.records_processed} procesados
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(lastSync.status)}>
                {lastSync.status === 'success' ? 'Exitosa' :
                 lastSync.status === 'error' ? 'Error' :
                 lastSync.status === 'processing' ? 'Procesando' : 'Desconocido'}
              </Badge>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay sincronizaciones registradas</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Estadísticas generales */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Estadísticas de Sincronización
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-green-600">
                {syncStats.successfulSyncs}
              </p>
              <p className="text-xs text-muted-foreground">Exitosas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-red-600">
                {syncStats.failedSyncs}
              </p>
              <p className="text-xs text-muted-foreground">Con Error</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-blue-600">
                {syncStats.totalRecordsImported}
              </p>
              <p className="text-xs text-muted-foreground">Registros Importados</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-purple-600">
                {syncStats.totalRecordsProcessed}
              </p>
              <p className="text-xs text-muted-foreground">Registros Procesados</p>
            </div>
          </div>
        </div>

        {/* Información sobre sincronización automática */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Sincronización Automática</p>
              <p className="text-blue-600">
                Los datos se sincronizan automáticamente cada 5 horas con Quantum Economics
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
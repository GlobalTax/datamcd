import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, Calendar, FileBarChart, RotateCcw } from 'lucide-react';
import { useQuantumIntegration } from '@/hooks/useQuantumIntegration';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuantumDataDialogProps {
  children: React.ReactNode;
}

export function QuantumDataDialog({ children }: QuantumDataDialogProps) {
  const { effectiveFranchisee } = useUnifiedAuth();
  const {
    accountingData,
    accountMappings,
    syncLogs,
    isLoading,
    isSyncing,
    syncQuantumData
  } = useQuantumIntegration(effectiveFranchisee?.id);

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredAccountingData = accountingData?.filter(account =>
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.quantum_account_code.includes(searchTerm)
  );

  const handleManualSync = async () => {
    if (!effectiveFranchisee?.id || !startDate || !endDate) return;

    await syncQuantumData({
      franchisee_id: effectiveFranchisee.id,
      period_start: startDate,
      period_end: endDate,
      sync_type: 'manual'
    });
  };

  const getMappingForAccount = (accountCode: string) => {
    return accountMappings?.find(mapping => mapping.quantum_account_code === accountCode);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Integración Quantum Economics
          </DialogTitle>
          <DialogDescription>
            Gestiona la sincronización y visualiza los datos contables de Quantum Economics
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="data" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data">Datos Contables</TabsTrigger>
            <TabsTrigger value="mappings">Mapeos</TabsTrigger>
            <TabsTrigger value="sync">Sincronización</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar Cuenta</Label>
                <Input
                  id="search"
                  placeholder="Buscar por código o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Cargando datos...
                  </div>
                ) : filteredAccountingData?.length ? (
                  filteredAccountingData.map((account) => {
                    const mapping = getMappingForAccount(account.quantum_account_code);
                    return (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">
                              {account.quantum_account_code}
                            </span>
                            <span className="text-sm">
                              {account.account_name}
                            </span>
                            {mapping && (
                              <Badge variant="secondary" className="text-xs">
                                {mapping.profit_loss_field}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {account.account_type} • Último sync: {format(new Date(account.last_sync), 'PPp', { locale: es })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(account.balance)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {account.period_start} - {account.period_end}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay datos contables disponibles</p>
                    <p className="text-xs">Realiza una sincronización para importar datos</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="mappings" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Configuración de mapeo entre cuentas de Quantum y campos de P&L
            </div>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {accountMappings?.map((mapping) => (
                  <div
                    key={mapping.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {mapping.quantum_account_code}
                        </span>
                        <span className="text-sm">
                          {mapping.quantum_account_name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mapping.profit_loss_category}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {mapping.profit_loss_field}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {mapping.mapping_type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Fecha Inicio</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Fecha Fin</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleManualSync}
                disabled={isSyncing || !startDate || !endDate}
                className="mt-6"
              >
                {isSyncing ? (
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Sincronizar
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Historial de Sincronizaciones</h4>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {syncLogs?.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {format(new Date(log.sync_started_at), 'PPp', { locale: es })}
                          </span>
                          <Badge
                            variant={log.status === 'success' ? 'default' : 
                                   log.status === 'error' ? 'destructive' : 'secondary'}
                          >
                            {log.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.records_imported} importados de {log.records_processed} procesados
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {log.sync_type}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
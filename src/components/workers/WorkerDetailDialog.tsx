import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UnifiedWorker } from '@/hooks/useWorkersPanel';
import { Building2, Database, Link, User, Mail, Phone, Calendar, CreditCard, FileText, AlertTriangle } from 'lucide-react';

interface WorkerDetailDialogProps {
  worker: UnifiedWorker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WorkerDetailDialog: React.FC<WorkerDetailDialogProps> = ({
  worker,
  open,
  onOpenChange,
}) => {
  if (!worker) return null;

  const getSourceIcon = (source: 'orquest' | 'biloop' | 'unified') => {
    if (source === 'unified') return <Link className="h-4 w-4" />;
    return source === 'orquest' ? (
      <Building2 className="h-4 w-4" />
    ) : (
      <Database className="h-4 w-4" />
    );
  };

  const getSourceLabel = (source: 'orquest' | 'biloop' | 'unified') => {
    switch (source) {
      case 'orquest': return 'Solo Orquest';
      case 'biloop': return 'Solo Biloop';
      case 'unified': return 'Datos Vinculados';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {worker.nombre} {worker.apellidos}
          </DialogTitle>
          <DialogDescription>
            NIF: {worker.nif} | Vista unificada de datos laborales
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado de vinculación */}
          <div className="flex items-center gap-4">
            <Badge 
              variant={worker.isFullyLinked ? "default" : "secondary"}
              className="flex items-center gap-2"
            >
              {getSourceIcon(worker.source)}
              {getSourceLabel(worker.source)}
            </Badge>
            
            {!worker.isFullyLinked && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Datos incompletos</span>
              </div>
            )}
          </div>

          {/* Información básica */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Información Personal</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Nombre:</span>
                  <span>{worker.nombre} {worker.apellidos}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">NIF:</span>
                  <span>{worker.nif}</span>
                </div>
              </div>
              <div className="space-y-2">
                {worker.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{worker.email}</span>
                  </div>
                )}
                {worker.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Teléfono:</span>
                    <span>{worker.telefono}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información laboral general */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Información Laboral</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Puesto:</span>
                  <span>{worker.puesto || 'No especificado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Departamento:</span>
                  <span>{worker.departamento || 'No especificado'}</span>
                </div>
              </div>
              <div className="space-y-2">
                {worker.fechaAlta && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Fecha Alta:</span>
                    <span>{new Date(worker.fechaAlta).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Estado:</span>
                  <Badge variant={worker.estado === 'activo' ? 'default' : 'secondary'}>
                    {worker.estado || 'No especificado'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Datos de Orquest */}
          {worker.hasOrquestData && worker.orquestData && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Datos Operacionales (Orquest)
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Service ID:</span>
                    <span className="font-mono text-sm">{worker.orquestData.serviceId}</span>
                  </div>
                  {worker.orquestData.updatedAt && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Última actualización:</span>
                      <span>{new Date(worker.orquestData.updatedAt).toLocaleString('es-ES')}</span>
                    </div>
                  )}
                  {worker.orquestData.datosCompletos && (
                    <div>
                      <span className="font-medium">Datos adicionales:</span>
                      <pre className="text-xs bg-background p-2 rounded border mt-1 overflow-x-auto">
                        {JSON.stringify(worker.orquestData.datosCompletos, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Datos de Biloop */}
          {worker.hasBiloopData && worker.biloopData && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Datos Regulatorios (Biloop)
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {worker.biloopData.salary && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Salario:</span>
                          <span>{worker.biloopData.salary.toLocaleString('es-ES', {
                            style: 'currency',
                            currency: 'EUR'
                          })}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Tipo de contrato:</span>
                        <span>{worker.biloopData.contractType || 'No especificado'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {worker.biloopData.socialSecurityNumber && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Nº SS:</span>
                          <span className="font-mono text-sm">{worker.biloopData.socialSecurityNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Estado contractual:</span>
                        <Badge variant={worker.biloopData.status === 'active' ? 'default' : 'secondary'}>
                          {worker.biloopData.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {(worker.biloopData.startDate || worker.biloopData.endDate) && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      {worker.biloopData.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Inicio contrato:</span>
                          <span>{new Date(worker.biloopData.startDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      {worker.biloopData.endDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Fin contrato:</span>
                          <span>{new Date(worker.biloopData.endDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Sugerencias de vinculación */}
          {!worker.isFullyLinked && (
            <>
              <Separator />
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Datos incompletos
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Este empleado solo tiene datos de {worker.hasOrquestData ? 'Orquest' : 'Biloop'}. 
                  Para una vista completa, asegúrate de que el NIF esté correctamente configurado en ambos sistemas.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
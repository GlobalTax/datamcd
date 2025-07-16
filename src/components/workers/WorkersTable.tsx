import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Database, Phone, Mail, User, Calendar } from 'lucide-react';
import { UnifiedWorker } from '@/hooks/useWorkersPanel';

interface WorkersTableProps {
  workers: UnifiedWorker[];
  loading: boolean;
  showSource?: boolean;
}

export const WorkersTable: React.FC<WorkersTableProps> = ({
  workers,
  loading,
  showSource = false
}) => {
  const getSourceIcon = (source: 'orquest' | 'biloop') => {
    return source === 'orquest' ? (
      <Building2 className="h-3 w-3" />
    ) : (
      <Database className="h-3 w-3" />
    );
  };

  const getStatusBadge = (estado?: string) => {
    if (!estado) return null;
    
    const status = estado.toLowerCase();
    const variant = status === 'activo' || status === 'active' ? 'default' : 'secondary';
    
    return (
      <Badge variant={variant} className="text-xs">
        {estado}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
        ))}
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay trabajadores registrados</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showSource && <TableHead className="w-[100px]">Sistema</TableHead>}
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Puesto</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Fecha Alta</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker) => (
            <TableRow key={worker.id}>
              {showSource && (
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1 w-fit"
                  >
                    {getSourceIcon(worker.source)}
                    {worker.source === 'orquest' ? 'Orquest' : 'Biloop'}
                  </Badge>
                </TableCell>
              )}
              <TableCell>
                <div className="font-medium">
                  {worker.nombre} {worker.apellidos}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {worker.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{worker.email}</span>
                    </div>
                  )}
                  {worker.telefono && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{worker.telefono}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{worker.puesto || '-'}</TableCell>
              <TableCell>{worker.departamento || '-'}</TableCell>
              <TableCell>
                {worker.fechaAlta ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {new Date(worker.fechaAlta).toLocaleDateString('es-ES')}
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {getStatusBadge(worker.estado)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
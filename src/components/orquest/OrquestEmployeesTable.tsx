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
import { Skeleton } from '@/components/ui/skeleton';

interface OrquestEmployee {
  id: string;
  service_id: string;
  nombre: string | null;
  apellidos: string | null;
  email: string | null;
  telefono: string | null;
  puesto: string | null;
  departamento: string | null;
  fecha_alta: string | null;
  fecha_baja: string | null;
  estado: string | null;
  updated_at: string | null;
}

interface OrquestEmployeesTableProps {
  employees: OrquestEmployee[];
  loading: boolean;
}

export const OrquestEmployeesTable: React.FC<OrquestEmployeesTableProps> = ({
  employees,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay empleados sincronizados todavía.
      </div>
    );
  }

  const getStatusBadge = (estado: string | null) => {
    switch (estado) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Activo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactivo</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Puesto</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Alta</TableHead>
            <TableHead>Última Actualización</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-mono text-xs">
                {employee.id}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {employee.nombre} {employee.apellidos}
                </div>
                {employee.telefono && (
                  <div className="text-xs text-muted-foreground">
                    {employee.telefono}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {employee.email && (
                  <div className="text-sm">{employee.email}</div>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">{employee.puesto || '-'}</div>
                {employee.departamento && (
                  <div className="text-xs text-muted-foreground">
                    {employee.departamento}
                  </div>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {employee.service_id}
              </TableCell>
              <TableCell>
                {getStatusBadge(employee.estado)}
              </TableCell>
              <TableCell>
                {employee.fecha_alta 
                  ? new Date(employee.fecha_alta).toLocaleDateString()
                  : '-'
                }
              </TableCell>
              <TableCell>
                {employee.updated_at 
                  ? new Date(employee.updated_at).toLocaleString()
                  : '-'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
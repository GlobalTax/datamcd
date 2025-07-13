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
import { Button } from '@/components/ui/button';
import { OrquestService } from '@/types/orquest';
import { MapPin, Clock, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrquestServicesTableProps {
  services: OrquestService[];
  loading: boolean;
}

export const OrquestServicesTable: React.FC<OrquestServicesTableProps> = ({
  services,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No hay servicios disponibles</p>
        <p className="text-sm text-muted-foreground">
          Haz clic en "Sincronizar" para cargar servicios desde Orquest
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead>Zona Horaria</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Última Actualización</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">
              {service.nombre || 'Sin nombre'}
            </TableCell>
            <TableCell>
              {service.latitud && service.longitud ? (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">
                    {service.latitud.toFixed(4)}, {service.longitud.toFixed(4)}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">No ubicación</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">
                  {service.zona_horaria || 'No especificada'}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant={service.datos_completos ? "default" : "secondary"}
              >
                {service.datos_completos ? "Activo" : "Incompleto"}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {service.updated_at 
                ? new Date(service.updated_at).toLocaleString()
                : 'Nunca'
              }
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
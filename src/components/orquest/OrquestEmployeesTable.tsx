import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);

  // Filtros
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      `${employee.nombre} ${employee.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.puesto?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = selectedService === 'all' || employee.service_id === selectedService;
    const matchesStatus = selectedStatus === 'all' || employee.estado === selectedStatus;
    const matchesInactive = showInactive || employee.estado !== 'inactive';

    return matchesSearch && matchesService && matchesStatus && matchesInactive;
  });

  // Obtener servicios únicos
  const uniqueServices = [...new Set(employees.map(emp => emp.service_id))].filter(Boolean);

  // Obtener estados únicos
  const uniqueStatuses = [...new Set(employees.map(emp => emp.estado))].filter(Boolean);

  const getStatusBadge = (estado: string | null) => {
    switch (estado) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Activo
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            Inactivo
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Desconocido
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Users className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>No hay empleados sincronizados:</strong> Ejecuta una sincronización 
          para obtener los datos de empleados desde Orquest.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total</p>
                <p className="text-2xl font-bold text-blue-900">{employees.length}</p>
              </div>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Activos</p>
                <p className="text-2xl font-bold text-green-900">
                  {employees.filter(emp => emp.estado === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Servicios</p>
                <p className="text-2xl font-bold text-purple-900">{uniqueServices.length}</p>
              </div>
              <Building className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Filtrados</p>
                <p className="text-2xl font-bold text-orange-900">{filteredEmployees.length}</p>
              </div>
              <Filter className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de filtrado */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o puesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background text-foreground"
        >
          <option value="all">Todos los servicios</option>
          {uniqueServices.map(service => (
            <option key={service} value={service}>
              Servicio {service}
            </option>
          ))}
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background text-foreground"
        >
          <option value="all">Todos los estados</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>
              {status === 'active' ? 'Activo' : 
               status === 'inactive' ? 'Inactivo' : 
               status === 'pending' ? 'Pendiente' : 
               status}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          onClick={() => setShowInactive(!showInactive)}
          className="flex items-center gap-2"
        >
          {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
        </Button>
      </div>

      {/* Tabla de empleados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Empleados ({filteredEmployees.length})
          </CardTitle>
          <CardDescription>
            Datos de empleados sincronizados desde Orquest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Alta</TableHead>
                  <TableHead>Actualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No se encontraron empleados con los filtros aplicados
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        {employee.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {employee.nombre && employee.apellidos 
                                ? `${employee.nombre} ${employee.apellidos}`
                                : employee.nombre || employee.apellidos || 'Sin nombre'
                              }
                            </div>
                            {employee.telefono && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {employee.telefono}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.email ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {employee.email}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.puesto || '-'}
                        </div>
                        {employee.departamento && (
                          <div className="text-xs text-muted-foreground">
                            {employee.departamento}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <Badge variant="outline" className="bg-slate-100">
                          {employee.service_id}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(employee.estado)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {formatDate(employee.fecha_alta)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(employee.updated_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de resultados */}
      {filteredEmployees.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {filteredEmployees.length} de {employees.length} empleados
        </div>
      )}
    </div>
  );
};
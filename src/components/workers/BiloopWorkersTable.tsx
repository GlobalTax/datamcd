import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Search, 
  Download, 
  Filter,
  Eye,
  Mail,
  Phone,
  RefreshCw
} from 'lucide-react';
import { useBiloop, BiloopEmployee } from '@/hooks/useBiloop';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface BiloopWorkersTableProps {
  selectedCompany: string;
}

export const BiloopWorkersTable: React.FC<BiloopWorkersTableProps> = ({ selectedCompany }) => {
  const [employees, setEmployees] = useState<BiloopEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<BiloopEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<BiloopEmployee | null>(null);

  const { getEmployees } = useBiloop();
  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();
  }, [selectedCompany]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    if (!selectedCompany) return;
    
    setLoading(true);
    try {
      const data = await getEmployees(selectedCompany);
      const employeesArray = Array.isArray(data) ? data : [];
      setEmployees(employeesArray);
      toast({
        title: "Empleados cargados",
        description: `Se han cargado ${employeesArray.length} empleados`,
      });
    } catch (error) {
      logger.error('Error loading employees', {}, error as Error);
      setEmployees([]);
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(employee => 
      employee.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Apellidos', 'DNI', 'Email', 'Teléfono', 'Estado', 'Fecha Alta'];
    const csvContent = [
      headers.join(','),
      ...filteredEmployees.map(emp => [
        emp.nombre || '',
        emp.apellidos || '',
        emp.dni || '',
        emp.email || '',
        emp.telefono || '',
        emp.estado || '',
        emp.fechaAlta || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `empleados_biloop_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Empleados Biloop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Empleados Biloop ({filteredEmployees.length})
            </CardTitle>
            <CardDescription>
              Gestión de empleados desde Biloop
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadEmployees} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button variant="outline" onClick={exportToCSV} disabled={filteredEmployees.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, DNI, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Employees Table */}
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {employees.length === 0 ? 'No hay empleados disponibles' : 'No se encontraron empleados con los criterios de búsqueda'}
            </p>
            {employees.length === 0 && (
              <Button onClick={loadEmployees} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Cargar Empleados
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Alta</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee, index) => (
                  <TableRow key={employee.id || index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {employee.nombre} {employee.apellidos}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {employee.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {employee.dni || 'No disponible'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {employee.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </div>
                        )}
                        {employee.telefono && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {employee.telefono}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={employee.estado === 'activo' ? 'default' : 'secondary'}
                      >
                        {employee.estado || 'No especificado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.fechaAlta 
                        ? new Date(employee.fechaAlta).toLocaleDateString() 
                        : 'No disponible'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
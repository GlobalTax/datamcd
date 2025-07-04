import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Mail, Phone, Search, Filter, Download, FileSpreadsheet } from 'lucide-react';
import { Employee } from '@/types/employee';
import { toast } from 'sonner';
import { useDataExport } from '@/hooks/useDataExport';
import { EmployeeEditDialog } from './EmployeeEditDialog';
import { EmployeeDeleteDialog } from './EmployeeDeleteDialog';

interface EmployeeListProps {
  employees: Employee[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateEmployee: (employeeId: string, data: any) => Promise<boolean>;
  onDeleteEmployee: (employeeId: string) => Promise<boolean>;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  loading,
  onRefresh,
  onUpdateEmployee,
  onDeleteEmployee
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const { exportToPDF, exportEmployeesToExcel, isExporting } = useDataExport();
  
  // Edit/Delete state
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);

  const getStatusBadge = (status: Employee['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      terminated: 'Terminado',
      suspended: 'Suspendido'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getContractTypeBadge = (contractType: Employee['contract_type']) => {
    const labels = {
      indefinido: 'Indefinido',
      temporal: 'Temporal',
      practicas: 'Prácticas',
      becario: 'Becario',
      freelance: 'Freelance'
    };

    return (
      <Badge variant="outline">
        {labels[contractType]}
      </Badge>
    );
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    const matchesDepartment = departmentFilter === 'all' || 
      (employee.department && employee.department === departmentFilter);

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)));

  const formatSalary = (salary?: number) => {
    if (!salary) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(salary);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 bg-red-600 rounded-xl animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando empleados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
            <SelectItem value="terminated">Terminado</SelectItem>
            <SelectItem value="suspended">Suspendido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept || ''}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count and export buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Mostrando {filteredEmployees.length} de {employees.length} empleados
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportEmployeesToExcel(filteredEmployees)}
            disabled={isExporting || filteredEmployees.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToPDF('employees-table', 'lista-empleados')}
            disabled={isExporting || filteredEmployees.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <div id="employees-table" className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Puesto</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Salario</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Desde {new Date(employee.hire_date).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">
                  {employee.employee_number}
                </TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.department || '-'}</TableCell>
                <TableCell>
                  {getContractTypeBadge(employee.contract_type)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(employee.status)}
                </TableCell>
                <TableCell>
                  {formatSalary(employee.base_salary)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {employee.email && (
                      <a
                        href={`mailto:${employee.email}`}
                        className="text-blue-600 hover:text-blue-800"
                        title={employee.email}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {employee.phone && (
                      <a
                        href={`tel:${employee.phone}`}
                        className="text-green-600 hover:text-green-800"
                        title={employee.phone}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditEmployee(employee)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteEmployee(employee)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No se encontraron empleados que coincidan con los filtros.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <EmployeeEditDialog
        employee={editEmployee}
        open={!!editEmployee}
        onOpenChange={(open) => !open && setEditEmployee(null)}
        onUpdate={onUpdateEmployee}
      />

      {/* Delete Dialog */}
      <EmployeeDeleteDialog
        employee={deleteEmployee}
        open={!!deleteEmployee}
        onOpenChange={(open) => !open && setDeleteEmployee(null)}
        onDelete={onDeleteEmployee}
      />
    </div>
  );
};
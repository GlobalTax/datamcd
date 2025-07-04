import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileText, Download, Calendar } from 'lucide-react';
import { Employee } from '@/types/employee';

interface PayrollViewProps {
  employees: Employee[];
}

export const PayrollView: React.FC<PayrollViewProps> = ({ employees }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Mock payroll data
  const mockPayrollData = employees.filter(emp => emp.status === 'active').map(employee => ({
    id: `payroll-${employee.id}`,
    employee_id: employee.id,
    employee: employee,
    period_start: `${selectedMonth}-01`,
    period_end: `${selectedMonth}-31`,
    regular_hours: 160,
    overtime_hours: 8,
    base_pay: employee.base_salary || 1500,
    overtime_pay: (employee.hourly_rate || 10) * 8 * 1.5,
    bonuses: 0,
    commissions: 0,
    social_security: (employee.base_salary || 1500) * 0.0635,
    income_tax: (employee.base_salary || 1500) * 0.15,
    other_deductions: 0,
    gross_pay: (employee.base_salary || 1500) + ((employee.hourly_rate || 10) * 8 * 1.5),
    net_pay: (employee.base_salary || 1500) + ((employee.hourly_rate || 10) * 8 * 1.5) - 
             ((employee.base_salary || 1500) * 0.0635) - ((employee.base_salary || 1500) * 0.15),
    status: 'draft' as const,
    payment_date: null
  }));

  const filteredPayroll = selectedEmployee 
    ? mockPayrollData.filter(payroll => payroll.employee_id === selectedEmployee)
    : mockPayrollData;

  const totalGrossPay = filteredPayroll.reduce((sum, payroll) => sum + payroll.gross_pay, 0);
  const totalNetPay = filteredPayroll.reduce((sum, payroll) => sum + payroll.net_pay, 0);
  const totalDeductions = filteredPayroll.reduce((sum, payroll) => 
    sum + payroll.social_security + payroll.income_tax + payroll.other_deductions, 0);

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800'
    };

    const labels = {
      draft: 'Borrador',
      approved: 'Aprobado',
      paid: 'Pagado'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Nómina Bruta Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalGrossPay)}
            </div>
            <p className="text-xs text-gray-500">
              {filteredPayroll.length} empleados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Deducciones Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDeductions)}
            </div>
            <p className="text-xs text-gray-500">
              SS + Impuestos + Otros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Nómina Neta Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalNetPay)}
            </div>
            <p className="text-xs text-gray-500">
              A pagar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Nóminas del Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Mes</label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Empleado</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los empleados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los empleados</SelectItem>
                  {employees.filter(emp => emp.status === 'active').map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generar Nóminas
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Salario Base</TableHead>
                  <TableHead>Extras</TableHead>
                  <TableHead>Bruto</TableHead>
                  <TableHead>Deducciones</TableHead>
                  <TableHead>Neto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayroll.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {payroll.employee.first_name} {payroll.employee.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payroll.employee.position}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Regular: {payroll.regular_hours}h</div>
                        {payroll.overtime_hours > 0 && (
                          <div className="text-orange-600">
                            Extra: {payroll.overtime_hours}h
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payroll.base_pay)}
                    </TableCell>
                    <TableCell>
                      {payroll.overtime_pay > 0 ? (
                        <div className="text-sm">
                          <div className="text-orange-600">
                            {formatCurrency(payroll.overtime_pay)}
                          </div>
                          {payroll.bonuses > 0 && (
                            <div className="text-green-600">
                              +{formatCurrency(payroll.bonuses)}
                            </div>
                          )}
                        </div>
                      ) : (
                        formatCurrency(payroll.bonuses)
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(payroll.gross_pay)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-red-600">
                        {formatCurrency(payroll.social_security + payroll.income_tax + payroll.other_deductions)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {formatCurrency(payroll.net_pay)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payroll.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayroll.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No hay nóminas generadas para este período</p>
              <Button className="mt-4">
                <FileText className="w-4 h-4 mr-2" />
                Generar Nóminas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
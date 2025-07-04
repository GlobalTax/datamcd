import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Play, Square, Calendar } from 'lucide-react';
import { Employee } from '@/types/employee';

interface TimeTrackingViewProps {
  employees: Employee[];
}

export const TimeTrackingView: React.FC<TimeTrackingViewProps> = ({ employees }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const mockTimeData = [
    {
      id: '1',
      employee: employees[0],
      date: selectedDate,
      clockIn: '09:00',
      clockOut: '17:00',
      breakStart: '13:00',
      breakEnd: '14:00',
      totalHours: 7,
      overtimeHours: 0,
      status: 'approved' as const
    }
  ];

  const formatTime = (time: string) => {
    return time || '--:--';
  };

  const calculateHours = (clockIn?: string, clockOut?: string, breakDuration = 1) => {
    if (!clockIn || !clockOut) return 0;
    
    const [inHour, inMin] = clockIn.split(':').map(Number);
    const [outHour, outMin] = clockOut.split(':').map(Number);
    
    const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin) - (breakDuration * 60);
    return Math.max(0, totalMinutes / 60);
  };

  return (
    <div className="space-y-6">
      {/* Quick Clock In/Out */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Control de Horario Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empleado" />
              </SelectTrigger>
              <SelectContent>
                {employees.filter(emp => emp.status === 'active').map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!selectedEmployee}
              >
                <Play className="w-4 h-4 mr-2" />
                Entrada
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={!selectedEmployee}
              >
                <Square className="w-4 h-4 mr-2" />
                Salida
              </Button>
            </div>

            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-2xl font-bold">
                {new Date().toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Registro de Horarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Tracking Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Descanso</TableHead>
                  <TableHead>Horas Totales</TableHead>
                  <TableHead>Horas Extra</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTimeData.length > 0 ? (
                  mockTimeData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.employee?.first_name} {record.employee?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.employee?.position}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatTime(record.clockIn)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatTime(record.clockOut)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatTime(record.breakStart)} - {formatTime(record.breakEnd)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.totalHours.toFixed(1)}h
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.overtimeHours > 0 ? (
                          <span className="text-orange-600">
                            {record.overtimeHours.toFixed(1)}h
                          </span>
                        ) : (
                          '0h'
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status === 'approved' ? 'Aprobado' :
                           record.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      No hay registros de horarios para la fecha seleccionada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
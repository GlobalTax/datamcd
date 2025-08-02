import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Settings, CheckCircle } from 'lucide-react';

interface RestaurantOperationsTabProps {
  restaurantId: string;
}

export const RestaurantOperationsTab: React.FC<RestaurantOperationsTabProps> = ({ restaurantId }) => {
  // Mock data for operations - in a real app, this would come from useRestaurantOperations hook
  const operationsData = {
    currentShift: {
      status: 'active',
      startTime: '09:00',
      endTime: '22:00',
      manager: 'Juan Pérez',
      staffCount: 12,
    },
    todaySchedule: [
      { time: '09:00-17:00', shift: 'Mañana', staff: 8, manager: 'Juan Pérez' },
      { time: '17:00-22:00', shift: 'Tarde', staff: 6, manager: 'María García' },
      { time: '22:00-02:00', shift: 'Noche', staff: 4, manager: 'Carlos López' },
    ],
    maintenanceTasks: [
      { id: 1, task: 'Limpieza de campana extractora', status: 'completed', due: '2024-01-15' },
      { id: 2, task: 'Revisión sistema refrigeración', status: 'pending', due: '2024-01-20' },
      { id: 3, task: 'Calibración balanzas', status: 'in_progress', due: '2024-01-18' },
      { id: 4, task: 'Inspección extintor', status: 'pending', due: '2024-01-25' },
    ],
    inventoryStatus: {
      lowStock: 3,
      criticalStock: 1,
      totalItems: 150,
      lastUpdate: '2024-01-15 08:30',
    },
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En progreso';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Operations Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turno Actual</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operationsData.currentShift.status === 'active' ? 'Activo' : 'Cerrado'}
            </div>
            <p className="text-xs text-muted-foreground">
              {operationsData.currentShift.startTime} - {operationsData.currentShift.endTime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
            <Badge variant="outline">{operationsData.currentShift.staffCount}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationsData.currentShift.staffCount}</div>
            <p className="text-xs text-muted-foreground">
              Manager: {operationsData.currentShift.manager}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventario</CardTitle>
            <Settings className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationsData.inventoryStatus.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {operationsData.inventoryStatus.lowStock} bajo stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mantenimiento</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operationsData.maintenanceTasks.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Tareas pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Horario de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {operationsData.todaySchedule.map((shift, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{shift.shift}</p>
                    <p className="text-sm text-muted-foreground">{shift.time}</p>
                  </div>
                  <Badge variant="outline">{shift.staff} empleados</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <p className="font-medium">{shift.manager}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tareas de Mantenimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Tarea</th>
                  <th className="text-left py-2">Estado</th>
                  <th className="text-left py-2">Fecha Límite</th>
                </tr>
              </thead>
              <tbody>
                {operationsData.maintenanceTasks.map((task) => (
                  <tr key={task.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 font-medium">{task.task}</td>
                    <td className="py-3">
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(task.due).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600">Stock Normal</p>
              <p className="text-2xl font-bold text-green-700">
                {operationsData.inventoryStatus.totalItems - 
                 operationsData.inventoryStatus.lowStock - 
                 operationsData.inventoryStatus.criticalStock}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-700">
                {operationsData.inventoryStatus.lowStock}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600">Stock Crítico</p>
              <p className="text-2xl font-bold text-red-700">
                {operationsData.inventoryStatus.criticalStock}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Última actualización: {operationsData.inventoryStatus.lastUpdate}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
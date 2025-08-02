import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRestaurantPersonnel } from '@/hooks/useRestaurantPersonnel';
import { Users, UserPlus, Clock, Euro, Calendar } from 'lucide-react';

interface RestaurantPersonnelTabProps {
  restaurantId: string;
}

export const RestaurantPersonnelTab: React.FC<RestaurantPersonnelTabProps> = ({ restaurantId }) => {
  const { personnel, metrics, loading } = useRestaurantPersonnel(restaurantId);

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'terminated':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Personnel Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalEmployees} empleados totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nómina Mensual</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalPayroll ? formatCurrency(metrics.totalPayroll) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Trabajadas</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalHours}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Vacaciones/permisos</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.departmentDistribution.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{dept.department}</span>
                <Badge variant="outline">{dept.count} empleados</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Empleados</CardTitle>
          <Button size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo Empleado
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Nombre</th>
                  <th className="text-left py-2">Posición</th>
                  <th className="text-left py-2">Departamento</th>
                  <th className="text-left py-2">Estado</th>
                  <th className="text-left py-2">Fecha de Contratación</th>
                  <th className="text-left py-2">Salario</th>
                </tr>
              </thead>
              <tbody>
                {personnel.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 font-medium">
                      {employee.first_name} {employee.last_name}
                    </td>
                    <td className="py-3">{employee.position}</td>
                    <td className="py-3">{employee.department || 'N/A'}</td>
                    <td className="py-3">
                      <Badge variant={getStatusBadgeVariant(employee.status)}>
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(employee.hire_date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {employee.base_salary ? formatCurrency(employee.base_salary) : 
                       employee.hourly_rate ? `${employee.hourly_rate}€/h` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, DollarSign, Clock, Calendar } from 'lucide-react';
import { EmployeeStats as EmployeeStatsType } from '@/types/employee';

interface EmployeeStatsProps {
  stats: EmployeeStatsType;
}

export const EmployeeStats: React.FC<EmployeeStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Empleados
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.total_employees}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Empleados Activos
            </CardTitle>
            <UserCheck className="w-4 h-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.active_employees}
          </div>
          <p className="text-xs text-gray-500">
            {stats.total_employees > 0 
              ? `${Math.round((stats.active_employees / stats.total_employees) * 100)}% del total`
              : '0% del total'
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Empleados Inactivos
            </CardTitle>
            <UserX className="w-4 h-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.inactive_employees}
          </div>
          <p className="text-xs text-gray-500">
            {stats.total_employees > 0 
              ? `${Math.round((stats.inactive_employees / stats.total_employees) * 100)}% del total`
              : '0% del total'
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Nómina Total
            </CardTitle>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.total_payroll)}
          </div>
          <p className="text-xs text-gray-500">
            Mensual
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Salario Promedio
            </CardTitle>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.average_salary)}
          </div>
          <p className="text-xs text-gray-500">
            Por empleado activo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              Solicitudes Pendientes
            </CardTitle>
            <Calendar className="w-4 h-4 text-yellow-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending_time_off_requests}
          </div>
          <p className="text-xs text-gray-500">
            Vacaciones/Permisos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Clock, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Eye,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HRMetrics {
  totalEmployees: number;
  activeEmployees: number;
  monthlyHours: number;
  pendingVacations: number;
  contractsExpiring: number;
  monthlyCost: number;
  averageSalary: number;
  employeeTurnover: number;
}

interface HRDashboardWidgetProps {
  metrics: HRMetrics;
  loading?: boolean;
}

export const HRDashboardWidget: React.FC<HRDashboardWidgetProps> = ({ 
  metrics, 
  loading = false 
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Panel de RRHH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeEmployeePercentage = metrics.totalEmployees > 0 
    ? (metrics.activeEmployees / metrics.totalEmployees) * 100 
    : 0;

  const urgentAlerts = metrics.contractsExpiring + metrics.pendingVacations;

  return (
    <div className="space-y-6">
      {/* Header con métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
            <div className="flex items-center mt-2">
              <Progress value={activeEmployeePercentage} className="flex-1 mr-2" />
              <span className="text-xs text-muted-foreground">
                {metrics.activeEmployees} activos
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coste Mensual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.monthlyCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: €{metrics.averageSalary.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Mensuales</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.monthlyHours.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Rotación: {metrics.employeeTurnover}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${urgentAlerts > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Panel principal de RRHH */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Recursos Humanos
            </CardTitle>
            <CardDescription>
              Estado actual de la plantilla y alertas importantes
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/employees')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Todo
            </Button>
            <Button 
              size="sm"
              onClick={() => navigate('/employees')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Empleado
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Alertas importantes */}
          {urgentAlerts > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Alertas Pendientes</h3>
              </div>
              <div className="space-y-2">
                {metrics.contractsExpiring > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-700">
                      Contratos próximos a vencer
                    </span>
                    <Badge variant="secondary">{metrics.contractsExpiring}</Badge>
                  </div>
                )}
                {metrics.pendingVacations > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-700">
                      Solicitudes de vacaciones pendientes
                    </span>
                    <Badge variant="secondary">{metrics.pendingVacations}</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KPIs principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {((metrics.activeEmployees / metrics.totalEmployees) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-blue-600">Empleados Activos</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                €{(metrics.monthlyCost / metrics.activeEmployees).toFixed(0)}
              </div>
              <div className="text-sm text-green-600">Costo por Empleado</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {(metrics.monthlyHours / metrics.activeEmployees).toFixed(0)}h
              </div>
              <div className="text-sm text-purple-600">Horas Promedio</div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/employees')}
            >
              <Users className="h-4 w-4 mr-2" />
              Gestionar Empleados
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/workers')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Panel Trabajadores
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Control Horarios
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analíticas RRHH
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface LaborMetrics {
  totalWorkers: number;
  activeWorkers: number;
  monthlyCost: number;
  avgSalary: number;
  contractsExpiring: number;
  pendingRegistrations: number;
}

interface CostCenter {
  id: string;
  name: string;
  cost: number;
  workers: number;
}

interface LaborDashboardTabProps {
  restaurantId: string;
  restaurantName: string;
}

export const LaborDashboardTab: React.FC<LaborDashboardTabProps> = ({
  restaurantId,
  restaurantName
}) => {
  // Datos simulados - en implementación real vendrían de hooks
  const metrics: LaborMetrics = {
    totalWorkers: 12,
    activeWorkers: 11,
    monthlyCost: 45000,
    avgSalary: 2800,
    contractsExpiring: 2,
    pendingRegistrations: 1
  };

  const costCenters: CostCenter[] = [
    { id: 'kitchen', name: 'Cocina', cost: 18000, workers: 5 },
    { id: 'service', name: 'Servicio', cost: 15000, workers: 4 },
    { id: 'management', name: 'Gestión', cost: 12000, workers: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trabajadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalWorkers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeWorkers} activos
            </p>
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
              Promedio: €{metrics.avgSalary.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.contractsExpiring}</div>
            <p className="text-xs text-orange-600">
              Próximos a vencer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trámites SS.SS.</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingRegistrations}</div>
            <p className="text-xs text-red-600">
              Pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por centro */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Área</CardTitle>
            <CardDescription>Costes y trabajadores por área de trabajo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {costCenters.map((center) => (
              <div key={center.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{center.name}</span>
                  <span>€{center.cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{center.workers} trabajadores</span>
                  <span>€{Math.round(center.cost / center.workers).toLocaleString()}/mes</span>
                </div>
                <Progress value={(center.cost / metrics.monthlyCost) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Estado de sistemas */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Sistemas</CardTitle>
            <CardDescription>Conexiones e integraciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Sistema Local</span>
              </div>
              <Badge variant="secondary">
                <CheckCircle className="w-3 h-3 mr-1" />
                Activo
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Orquest</span>
              </div>
              <Badge variant="secondary">
                <CheckCircle className="w-3 h-3 mr-1" />
                Conectado
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Biloop</span>
              </div>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                Pendiente
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de tendencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Resumen del Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">+2.5%</div>
              <div className="text-sm text-green-600">Productividad</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">-1.2%</div>
              <div className="text-sm text-blue-600">Absentismo</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">+3.8%</div>
              <div className="text-sm text-orange-600">Coste/Hora</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

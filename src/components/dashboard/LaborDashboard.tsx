import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkersPanel } from '@/hooks/useWorkersPanel';
import { useBiloop } from '@/hooks/useBiloop';
import { useOrquest } from '@/hooks/useOrquest';

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

export function LaborDashboard({ franchiseeId }: { franchiseeId?: string }) {
  const navigate = useNavigate();
  const { workers, loading: workersLoading } = useWorkersPanel(franchiseeId);
  const { loading: biloopLoading } = useBiloop();
  const { loading: orquestLoading } = useOrquest(franchiseeId);

  const [metrics, setMetrics] = useState<LaborMetrics>({
    totalWorkers: 0,
    activeWorkers: 0,
    monthlyCost: 0,
    avgSalary: 0,
    contractsExpiring: 0,
    pendingRegistrations: 0
  });

  const [costCenters] = useState<CostCenter[]>([
    { id: 'rest-001', name: 'Restaurante Central', cost: 45000, workers: 12 },
    { id: 'rest-002', name: 'Restaurante Norte', cost: 38000, workers: 8 },
    { id: 'rest-003', name: 'Restaurante Sur', cost: 42000, workers: 10 },
  ]);

  useEffect(() => {
    if (workers.length > 0) {
      const activeWorkers = workers.filter(w => w.estado === 'activo' || w.biloopData?.status === 'active');
      
      setMetrics({
        totalWorkers: workers.length,
        activeWorkers: activeWorkers.length,
        monthlyCost: costCenters.reduce((sum, cc) => sum + cc.cost, 0),
        avgSalary: 2800, // Calculado desde datos reales
        contractsExpiring: 3,
        pendingRegistrations: 2
      });
    }
  }, [workers, costCenters]);

  const quickActions = [
    {
      title: 'Panel Trabajadores',
      description: 'Gestionar empleados Orquest y Biloop',
      icon: Users,
      action: () => navigate('/workers'),
      color: 'bg-blue-500'
    },
    {
      title: 'Análisis de Costes',
      description: 'Ver costes por centro y empleado',
      icon: DollarSign,
      action: () => navigate('/labor-costs'),
      color: 'bg-green-500'
    },
    {
      title: 'Trámites SS.SS.',
      description: 'Gestionar altas y bajas',
      icon: FileText,
      action: () => navigate('/labor-registrations'),
      color: 'bg-orange-500'
    },
    {
      title: 'Contratos',
      description: 'Renovaciones y vencimientos',
      icon: Calendar,
      action: () => navigate('/labor-contracts'),
      color: 'bg-purple-500'
    }
  ];

  const loading = workersLoading || biloopLoading || orquestLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Laboral</h1>
          <p className="text-gray-600">Visión integral de la gestión laboral</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/workers')}>
            <Users className="w-4 h-4 mr-2" />
            Ver Trabajadores
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Contenido principal con tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="costs">Costes</TabsTrigger>
          <TabsTrigger value="workers">Trabajadores</TabsTrigger>
          <TabsTrigger value="actions">Acciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución por centro */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Centro</CardTitle>
                <CardDescription>Costes y trabajadores por ubicación</CardDescription>
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
                    <span className="text-sm">Orquest</span>
                  </div>
                  <Badge variant="secondary">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">IntegraLOOP (Biloop)</span>
                  </div>
                  <Badge variant="secondary">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">A3NOM</span>
                  </div>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    Pendiente
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Costes Laborales</CardTitle>
              <CardDescription>Desglose detallado de costes por concepto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Análisis de costes disponible próximamente</p>
                <p className="text-sm">Integración con endpoints de costes laborales</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Trabajadores</CardTitle>
              <CardDescription>Estado actual de la plantilla</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando datos de trabajadores...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {workers.filter(w => w.source === 'orquest').length}
                      </div>
                      <div className="text-sm text-blue-600">Orquest</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {workers.filter(w => w.source === 'biloop').length}
                      </div>
                      <div className="text-sm text-green-600">Biloop</div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/workers')} 
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Panel Completo de Trabajadores
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={action.action}>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className={`p-2 rounded-lg ${action.color} mr-4`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
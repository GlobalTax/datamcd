import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  Euro,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { useBiloop } from '@/hooks/useBiloop';
import { useToast } from '@/hooks/use-toast';

interface BiloopAnalyticsDashboardProps {
  selectedCompany: string;
}

export const BiloopAnalyticsDashboard: React.FC<BiloopAnalyticsDashboardProps> = ({ selectedCompany }) => {
  const [analyticsData, setAnalyticsData] = useState<any>({
    totalEmployees: 0,
    averageRemunerations: [],
    mediumRemunerations: [],
    workersBreakdown: [],
    costEmployees: [],
    payrollCosts: []
  });
  const [loading, setLoading] = useState(false);

  const { 
    getEmployees,
    getAverageRemunerations,
    getMediumRemunerations,
    getWorkersBreakdown,
    getCostEmployees,
    getPayrollCosts
  } = useBiloop();
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedCompany]);

  const loadAnalyticsData = async () => {
    if (!selectedCompany) return;
    
    setLoading(true);
    try {
      // Cargar datos básicos de empleados
      const employeesData = await getEmployees(selectedCompany);
      const totalEmployees = Array.isArray(employeesData) ? employeesData.length : 0;

      // Cargar datos de retribuciones
      const avgRemunerationsData = await getAverageRemunerations(selectedCompany);
      const mediumRemunerationsData = await getMediumRemunerations(selectedCompany);

      // Cargar datos de costes
      const costEmployeesData = await getCostEmployees(selectedCompany);
      const payrollCostsData = await getPayrollCosts(selectedCompany);

      // Cargar datos de brecha salarial
      const workersBreakdownData = await getWorkersBreakdown(selectedCompany);

      setAnalyticsData({
        totalEmployees,
        averageRemunerations: Array.isArray(avgRemunerationsData) ? avgRemunerationsData : [],
        mediumRemunerations: Array.isArray(mediumRemunerationsData) ? mediumRemunerationsData : [],
        workersBreakdown: Array.isArray(workersBreakdownData) ? workersBreakdownData : [],
        costEmployees: Array.isArray(costEmployeesData) ? costEmployeesData : [],
        payrollCosts: Array.isArray(payrollCostsData) ? payrollCostsData : []
      });

      toast({
        title: "Análisis actualizado",
        description: "Datos analíticos cargados correctamente",
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos analíticos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRemuneration = () => {
    if (analyticsData.averageRemunerations.length === 0) return 0;
    const total = analyticsData.averageRemunerations.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.importe) || 0);
    }, 0);
    return (total / analyticsData.averageRemunerations.length).toFixed(2);
  };

  const calculateTotalPayrollCost = () => {
    if (analyticsData.payrollCosts.length === 0) return 0;
    return analyticsData.payrollCosts.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.coste) || 0);
    }, 0).toFixed(2);
  };

  const exportAnalyticsReport = () => {
    const reportData = {
      fecha: new Date().toISOString(),
      empresa: selectedCompany,
      totalEmpleados: analyticsData.totalEmployees,
      retribucionPromedio: calculateAverageRemuneration(),
      costeNominaTotal: calculateTotalPayrollCost(),
      datosCompletos: analyticsData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_analytics_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Dashboard Analítico
              </CardTitle>
              <CardDescription>
                Análisis de datos laborales y retribuciones
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadAnalyticsData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button onClick={exportAnalyticsReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Reporte
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Empleados</p>
                <p className="text-2xl font-bold">{analyticsData.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retribución Promedio</p>
                <p className="text-2xl font-bold">{calculateAverageRemuneration()}€</p>
              </div>
              <Euro className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coste Nómina Total</p>
                <p className="text-2xl font-bold">{calculateTotalPayrollCost()}€</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Análisis Disponibles</p>
                <p className="text-2xl font-bold">
                  {analyticsData.workersBreakdown.length + analyticsData.costEmployees.length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Remunerations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Retribuciones Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.averageRemunerations.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay datos de retribuciones disponibles
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analyticsData.averageRemunerations.slice(0, 10).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{item.categoria || `Categoría ${index + 1}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.descripcion || 'Sin descripción'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {parseFloat(item.importe || 0).toFixed(2)}€
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workers Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Desglose de Trabajadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.workersBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay datos de desglose disponibles
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analyticsData.workersBreakdown.slice(0, 10).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{item.departamento || `Departamento ${index + 1}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.tipo || 'General'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">
                        {item.cantidad || 0} empleados
                      </Badge>
                      {item.porcentaje && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.porcentaje}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análisis de Costes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsData.costEmployees.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay datos de costes disponibles
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsData.costEmployees.slice(0, 9).map((cost: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{cost.concepto || `Concepto ${index + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{cost.periodo || 'Sin período'}</p>
                      </div>
                      <Badge variant="outline">
                        {parseFloat(cost.importe || 0).toFixed(2)}€
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
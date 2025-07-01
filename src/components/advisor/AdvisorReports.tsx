
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Store, 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  id: string;
  type: string;
  title: string;
  description: string;
  data: any;
  lastGenerated: string;
  status: 'ready' | 'generating' | 'error';
}

interface AdvisorReportsProps {
  advisorId?: string;
}

export const AdvisorReports: React.FC<AdvisorReportsProps> = ({ advisorId }) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState('month');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [advisorId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Simular carga de reportes (en un caso real vendría de la base de datos)
      const mockReports: ReportData[] = [
        {
          id: '1',
          type: 'financial',
          title: 'Reporte Financiero Mensual',
          description: 'Análisis completo de ingresos, gastos y rentabilidad',
          data: {
            totalRevenue: 1250000,
            totalExpenses: 850000,
            profitMargin: 32,
            growthRate: 8.5,
            topPerformers: ['McDonald\'s Centro', 'McDonald\'s Norte', 'McDonald\'s Sur']
          },
          lastGenerated: new Date().toISOString(),
          status: 'ready'
        },
        {
          id: '2',
          type: 'operational',
          title: 'Reporte Operacional',
          description: 'Métricas de rendimiento y eficiencia operativa',
          data: {
            totalRestaurants: 24,
            activeRestaurants: 22,
            averageEmployees: 45,
            customerSatisfaction: 4.2,
            operationalEfficiency: 87
          },
          lastGenerated: new Date(Date.now() - 86400000).toISOString(),
          status: 'ready'
        },
        {
          id: '3',
          type: 'franchisee',
          title: 'Reporte de Franquiciados',
          description: 'Análisis del rendimiento de franquiciados',
          data: {
            totalFranchisees: 18,
            activeFranchisees: 16,
            averagePerformance: 78,
            topFranchisees: ['Carlos García', 'María López', 'Juan Pérez'],
            improvementAreas: ['Gestión de inventario', 'Capacitación de personal']
          },
          lastGenerated: new Date(Date.now() - 172800000).toISOString(),
          status: 'ready'
        },
        {
          id: '4',
          type: 'comparative',
          title: 'Análisis Comparativo',
          description: 'Comparación entre restaurantes y franquiciados',
          data: {
            bestPerforming: 'McDonald\'s Centro',
            worstPerforming: 'McDonald\'s Este',
            performanceGap: 23,
            recommendations: ['Implementar mejores prácticas', 'Capacitación adicional']
          },
          lastGenerated: new Date(Date.now() - 259200000).toISOString(),
          status: 'ready'
        }
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      setGeneratingReport(reportType);
      
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // En un caso real, aquí se generaría el reporte en el backend
      console.log(`Generating ${reportType} report...`);
      
      setGeneratingReport(null);
      loadReports(); // Recargar reportes
    } catch (error) {
      console.error('Error generating report:', error);
      setGeneratingReport(null);
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <DollarSign className="h-6 w-6" />;
      case 'operational':
        return <Store className="h-6 w-6" />;
      case 'franchisee':
        return <Users className="h-6 w-6" />;
      case 'comparative':
        return <BarChart3 className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Listo</Badge>;
      case 'generating':
        return <Badge className="bg-yellow-100 text-yellow-800">Generando</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const handleExportReport = (report: ReportData) => {
    // Simular exportación
    const dataStr = JSON.stringify(report.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reportes y Análisis</CardTitle>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Última Semana</option>
                <option value="month">Último Mes</option>
                <option value="quarter">Último Trimestre</option>
                <option value="year">Último Año</option>
              </select>
              
              <Button variant="outline" onClick={loadReports}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Reportes disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getReportIcon(report.type)}
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
                {getStatusBadge(report.status)}
              </div>
              <p className="text-sm text-gray-600">{report.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Métricas rápidas */}
              <div className="grid grid-cols-2 gap-3">
                {report.type === 'financial' && (
                  <>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-gray-500">Ingresos</p>
                      <p className="font-semibold text-green-600">
                        ${report.data.totalRevenue?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-gray-500">Margen</p>
                      <p className="font-semibold text-blue-600">
                        {report.data.profitMargin || 0}%
                      </p>
                    </div>
                  </>
                )}
                
                {report.type === 'operational' && (
                  <>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-xs text-gray-500">Restaurantes</p>
                      <p className="font-semibold text-purple-600">
                        {report.data.activeRestaurants || 0}/{report.data.totalRestaurants || 0}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-gray-500">Eficiencia</p>
                      <p className="font-semibold text-orange-600">
                        {report.data.operationalEfficiency || 0}%
                      </p>
                    </div>
                  </>
                )}
                
                {report.type === 'franchisee' && (
                  <>
                    <div className="text-center p-2 bg-indigo-50 rounded">
                      <p className="text-xs text-gray-500">Franquiciados</p>
                      <p className="font-semibold text-indigo-600">
                        {report.data.activeFranchisees || 0}/{report.data.totalFranchisees || 0}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-teal-50 rounded">
                      <p className="text-xs text-gray-500">Rendimiento</p>
                      <p className="font-semibold text-teal-600">
                        {report.data.averagePerformance || 0}%
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Última generación: {new Date(report.lastGenerated).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedReport(report)}
                  className="flex-1"
                >
                  Ver Detalles
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleExportReport(report)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generación rápida de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Nuevo Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col"
              onClick={() => generateReport('financial')}
              disabled={generatingReport === 'financial'}
            >
              {generatingReport === 'financial' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
              ) : (
                <DollarSign className="h-6 w-6 mb-2" />
              )}
              <span className="text-sm">Reporte Financiero</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col"
              onClick={() => generateReport('operational')}
              disabled={generatingReport === 'operational'}
            >
              {generatingReport === 'operational' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
              ) : (
                <Store className="h-6 w-6 mb-2" />
              )}
              <span className="text-sm">Reporte Operacional</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col"
              onClick={() => generateReport('franchisee')}
              disabled={generatingReport === 'franchisee'}
            >
              {generatingReport === 'franchisee' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
              ) : (
                <Users className="h-6 w-6 mb-2" />
              )}
              <span className="text-sm">Reporte Franquiciados</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col"
              onClick={() => generateReport('comparative')}
              disabled={generatingReport === 'comparative'}
            >
              {generatingReport === 'comparative' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
              ) : (
                <BarChart3 className="h-6 w-6 mb-2" />
              )}
              <span className="text-sm">Análisis Comparativo</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles del reporte */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getReportIcon(selectedReport.type)}
                  <CardTitle>{selectedReport.title}</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                >
                  ×
                </Button>
              </div>
              <p className="text-gray-600">{selectedReport.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Datos del reporte */}
              <div>
                <h3 className="font-semibold mb-3">Datos del Reporte</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(selectedReport.data, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Gráficos simulados */}
              <div>
                <h3 className="font-semibold mb-3">Visualizaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de Barras</p>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico Circular</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { ReportFilters, ReportFilters as IReportFilters } from './ReportFilters';
import { ReportCharts } from './ReportCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertBanner } from '@/components/ui/alert-banner';
import { KpiChip } from '@/components/ui/kpi-chip';
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  Target,
  RefreshCw
} from 'lucide-react';
import { useDataExport } from '@/hooks/useDataExport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportData {
  id: string;
  type: string;
  title: string;
  data: any[];
  generatedAt: string;
  summary: {
    totalRecords: number;
    dateRange: string;
    status: 'completed' | 'processing' | 'error';
  };
}

export const AdvancedReportsPage: React.FC = () => {
  const [filters, setFilters] = useState<IReportFilters>({
    reportType: 'financial',
    restaurants: []
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string; site_number: string }>>([]);
  
  const { isExporting, exportToPDF, exportToExcel } = useDataExport();

  useEffect(() => {
    fetchRestaurants();
    generateInitialReport();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('base_restaurants')
        .select('id, restaurant_name, site_number')
        .order('restaurant_name');

      if (error) throw error;
      setRestaurants(data?.map(r => ({
        id: r.id,
        name: r.restaurant_name,
        site_number: r.site_number
      })) || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Error al cargar restaurantes');
    }
  };

  const generateInitialReport = () => {
    // Mock data para demostrar la funcionalidad
    const mockData = generateMockData('financial');
    setReportData({
      id: 'report-1',
      type: 'financial',
      title: 'Reporte Financiero',
      data: mockData,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRecords: mockData.length,
        dateRange: 'Últimos 12 meses',
        status: 'completed'
      }
    });
  };

  const generateMockData = (type: string) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    switch (type) {
      case 'financial':
        return months.map(month => ({
          month,
          revenue: Math.floor(Math.random() * 100000) + 150000,
          costs: Math.floor(Math.random() * 60000) + 80000,
          profit: Math.floor(Math.random() * 40000) + 20000
        }));
      
      case 'payroll':
        return [
          { name: 'Salarios Base', value: 45000 },
          { name: 'Horas Extra', value: 12000 },
          { name: 'Beneficios', value: 8000 },
          { name: 'Otros', value: 3000 }
        ];
      
      case 'incidents':
        return [
          { category: 'Equipos', count: 15 },
          { category: 'Mantenimiento', count: 8 },
          { category: 'Seguridad', count: 3 },
          { category: 'Limpieza', count: 12 }
        ];
      
      case 'performance':
        return restaurants.slice(0, 8).map(restaurant => ({
          restaurant: restaurant.name,
          performance: Math.floor(Math.random() * 40) + 60
        }));
      
      default:
        return [];
    }
  };

  const handleFiltersChange = (newFilters: IReportFilters) => {
    setFilters(newFilters);
    generateReport(newFilters);
  };

  const generateReport = async (reportFilters: IReportFilters) => {
    setLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData = generateMockData(reportFilters.reportType);
      
      setReportData({
        id: `report-${Date.now()}`,
        type: reportFilters.reportType,
        title: getReportTitle(reportFilters.reportType),
        data: mockData,
        generatedAt: new Date().toISOString(),
        summary: {
          totalRecords: mockData.length,
          dateRange: reportFilters.dateRange ? 
            `${reportFilters.dateRange.from?.toLocaleDateString()} - ${reportFilters.dateRange.to?.toLocaleDateString()}` :
            'Últimos 12 meses',
          status: 'completed'
        }
      });
      
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = (type: string) => {
    switch (type) {
      case 'financial': return 'Reporte Financiero';
      case 'payroll': return 'Reporte de Nómina';
      case 'incidents': return 'Reporte de Incidencias';
      case 'performance': return 'Reporte de Rendimiento';
      case 'comparative': return 'Reporte Comparativo';
      case 'operational': return 'Reporte Operacional';
      default: return 'Reporte';
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!reportData) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      if (format === 'pdf') {
        await exportToPDF('report-content', `${reportData.title}_${new Date().toISOString().split('T')[0]}`);
      } else if (format === 'excel') {
        await exportToExcel(
          reportData.data,
          `${reportData.title}_${new Date().toISOString().split('T')[0]}`,
          reportData.title
        );
      } else {
        // CSV export logic would go here
        toast.success('Exportación CSV completada');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <StandardLayout
      title="Sistema de Reportes Avanzado"
      description="Genera, visualiza y exporta reportes detallados"
    >
      <div className="space-y-6">
        {/* Filtros */}
        <ReportFilters
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
          isExporting={isExporting}
          restaurants={restaurants}
        />

        {/* Estado del Reporte */}
        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiChip
              value={reportData.summary.status === 'completed' ? 'Completado' : 'Procesando'}
              label="Estado del Reporte"
              trend="neutral"
            />
            <KpiChip
              value={reportData.summary.totalRecords.toString()}
              label="Total de Registros"
              trend="neutral"
            />
            <KpiChip
              value={reportData.summary.dateRange}
              label="Período"
              trend="neutral"
            />
            <KpiChip
              value={new Date(reportData.generatedAt).toLocaleTimeString()}
              label="Generado"
              trend="neutral"
            />
          </div>
        )}

        {/* Contenido del Reporte */}
        <div id="report-content">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Generando reporte...</p>
                </div>
              </CardContent>
            </Card>
          ) : reportData ? (
            <Tabs defaultValue="charts" className="space-y-4">
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Gráficos
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Datos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="charts">
                <ReportCharts data={reportData.data} reportType={reportData.type} />
              </TabsContent>

              <TabsContent value="data">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos del Reporte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            {reportData.data.length > 0 && Object.keys(reportData.data[0]).map(key => (
                              <th key={key} className="border border-gray-200 px-4 py-2 text-left font-semibold">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              {Object.values(row).map((value, cellIndex) => (
                                <td key={cellIndex} className="border border-gray-200 px-4 py-2">
                                  {typeof value === 'number' && value > 1000 ? 
                                    value.toLocaleString() : 
                                    String(value)
                                  }
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <AlertBanner
              variant="info"
              title="Sin datos"
            >
              Configura los filtros y genera tu primer reporte
            </AlertBanner>
          )}
        </div>
      </div>
    </StandardLayout>
  );
};

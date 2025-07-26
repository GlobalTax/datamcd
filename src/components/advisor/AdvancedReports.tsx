import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  Target,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportTemplate {
  id: string;
  template_name: string;
  description?: string;
  report_type: 'kpi' | 'financial' | 'operational' | 'comparative';
  configuration: any;
  is_public: boolean;
  created_at: string;
}

interface GeneratedReport {
  id: string;
  report_name: string;
  report_data: any;
  parameters?: any;
  generated_at: string;
  template?: ReportTemplate;
}

export const AdvancedReports: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('advisor_report_templates')
        .select('*')
        .or(`advisor_id.eq.${user?.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []).map(item => ({
        ...item,
        report_type: item.report_type as 'kpi' | 'financial' | 'operational' | 'comparative'
      })));
    } catch (error) {
      logger.error('Failed to fetch report templates', { error: error.message, action: 'fetch_templates' });
      toast.error('Error al cargar plantillas');
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('advisor_reports')
        .select(`
          *,
          template:advisor_report_templates(*)
        `)
        .eq('advisor_id', user?.id)
        .order('generated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReports((data || []).map(item => ({
        ...item,
        template: item.template ? {
          ...item.template,
          report_type: item.template.report_type as 'kpi' | 'financial' | 'operational' | 'comparative'
        } : undefined
      })));
    } catch (error) {
      logger.error('Failed to fetch reports', { error: error.message, action: 'fetch_reports' });
      toast.error('Error al cargar reportes');
    }
  };

  const generateReport = async (templateId: string, templateName: string) => {
    try {
      // Simular generación de reporte con datos mock
      const mockReportData = {
        summary: {
          totalFranchisees: 45,
          totalRestaurants: 67,
          totalRevenue: 2847392,
          avgPerformance: 87.3
        },
        charts: [
          {
            type: 'revenue_trend',
            data: [
              { month: 'Ene', value: 245000 },
              { month: 'Feb', value: 267000 },
              { month: 'Mar', value: 298000 },
              { month: 'Abr', value: 276000 },
              { month: 'May', value: 315000 },
              { month: 'Jun', value: 289000 }
            ]
          }
        ],
        tables: [
          {
            title: 'Top 5 Restaurantes por Ingresos',
            headers: ['Restaurante', 'Ciudad', 'Ingresos', 'Crecimiento'],
            rows: [
              ['Madrid Centro', 'Madrid', '€45,678', '+12.3%'],
              ['Barcelona Este', 'Barcelona', '€43,892', '+8.7%'],
              ['Valencia Norte', 'Valencia', '€41,234', '+15.2%'],
              ['Sevilla Centro', 'Sevilla', '€38,765', '+5.9%'],
              ['Bilbao Plaza', 'Bilbao', '€36,543', '+9.1%']
            ]
          }
        ]
      };

      const { error } = await supabase
        .from('advisor_reports')
        .insert({
          template_id: templateId,
          advisor_id: user?.id,
          report_name: `${templateName} - ${new Date().toLocaleDateString('es-ES')}`,
          report_data: mockReportData,
          parameters: {
            date_range: 'last_6_months',
            include_comparisons: true
          }
        });

      if (error) throw error;

      toast.success('Reporte generado exitosamente');
      fetchReports();
    } catch (error) {
      logger.error('Failed to generate report', { error: error.message, action: 'generate_report' });
      toast.error('Error al generar reporte');
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('advisor_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Reporte eliminado exitosamente');
      fetchReports();
    } catch (error) {
      logger.error('Failed to delete report', { error: error.message, action: 'delete_report' });
      toast.error('Error al eliminar reporte');
    }
  };

  const exportReport = (report: GeneratedReport) => {
    // Simular exportación de reporte
    const dataStr = JSON.stringify(report.report_data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.report_name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Reporte exportado exitosamente');
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTemplates(), fetchReports()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Simular algunas plantillas por defecto
  useEffect(() => {
    if (templates.length === 0) {
      const mockTemplates: ReportTemplate[] = [
        {
          id: '1',
          template_name: 'Reporte de KPIs Mensual',
          description: 'Métricas clave de rendimiento por restaurante',
          report_type: 'kpi',
          configuration: {},
          is_public: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          template_name: 'Análisis Financiero Trimestral',
          description: 'Ingresos, costos y rentabilidad por trimestre',
          report_type: 'financial',
          configuration: {},
          is_public: true,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          template_name: 'Comparativa de Restaurantes',
          description: 'Comparación de rendimiento entre ubicaciones',
          report_type: 'comparative',
          configuration: {},
          is_public: true,
          created_at: new Date().toISOString()
        }
      ];
      setTemplates(mockTemplates);
    }
  }, [templates.length]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = reportTypeFilter === 'all' || template.report_type === reportTypeFilter;
    return matchesSearch && matchesType;
  });

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'kpi': return <Target className="w-4 h-4" />;
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'operational': return <BarChart3 className="w-4 h-4" />;
      case 'comparative': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'kpi': return 'KPIs';
      case 'financial': return 'Financiero';
      case 'operational': return 'Operacional';
      case 'comparative': return 'Comparativo';
      default: return type;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'kpi': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'financial': return 'bg-green-100 text-green-800 border-green-200';
      case 'operational': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'comparative': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="reports">Reportes Generados</TabsTrigger>
          </TabsList>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>

        <TabsContent value="templates" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar plantillas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de reporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="kpi">KPIs</SelectItem>
                    <SelectItem value="financial">Financiero</SelectItem>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="comparative">Comparativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Plantillas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getReportTypeIcon(template.report_type)}
                      <CardTitle className="text-lg">{template.template_name}</CardTitle>
                    </div>
                    {template.is_public && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Pública
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge className={getReportTypeColor(template.report_type)} variant="outline">
                      {getReportTypeLabel(template.report_type)}
                    </Badge>
                  </div>
                  
                  {template.description && (
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Creado el {formatDate(template.created_at)}
                  </div>
                  
                  <Button 
                    onClick={() => generateReport(template.id, template.template_name)}
                    className="w-full"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generar Reporte
                  </Button>
                </CardContent>
              </Card>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay plantillas</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || reportTypeFilter !== 'all' 
                        ? 'No se encontraron plantillas con los filtros aplicados'
                        : 'Crea tu primera plantilla de reporte'
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{report.report_name}</h4>
                          {report.template && (
                            <Badge className={getReportTypeColor(report.template.report_type)} variant="outline">
                              {getReportTypeLabel(report.template.report_type)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Generado el {formatDate(report.generated_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => exportReport(report)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                      <Button
                        onClick={() => deleteReport(report.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {reports.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay reportes generados</h3>
                  <p className="text-muted-foreground">
                    Genera tu primer reporte usando una plantilla
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
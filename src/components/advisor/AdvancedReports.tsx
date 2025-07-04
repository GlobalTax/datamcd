import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Euro,
  Percent,
  Users,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportData {
  performanceMetrics: Array<{
    restaurant: string;
    revenue: number;
    growth: number;
    efficiency: number;
    satisfaction: number;
  }>;
  financialTrends: Array<{
    month: string;
    revenue: number;
    costs: number;
    profit: number;
    margin: number;
  }>;
  franchiseeComparison: Array<{
    franchisee: string;
    totalRevenue: number;
    avgGrowth: number;
    restaurantCount: number;
    performance: number;
  }>;
  geographicDistribution: Array<{
    region: string;
    count: number;
    revenue: number;
    color: string;
  }>;
}

export const AdvancedReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    performanceMetrics: [],
    financialTrends: [],
    franchiseeComparison: [],
    geographicDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subDays(new Date(), 30)),
    to: endOfMonth(new Date())
  });
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const generateMockData = () => {
    // Datos de rendimiento por restaurante
    const performanceMetrics = [
      { restaurant: 'McDonald\'s Goya', revenue: 125000, growth: 8.5, efficiency: 85, satisfaction: 4.2 },
      { restaurant: 'McDonald\'s Centro', revenue: 98000, growth: -2.1, efficiency: 78, satisfaction: 3.8 },
      { restaurant: 'McDonald\'s Malasaña', revenue: 110000, growth: 12.3, efficiency: 92, satisfaction: 4.5 },
      { restaurant: 'McDonald\'s Serrano', revenue: 87000, growth: 5.7, efficiency: 82, satisfaction: 4.0 },
      { restaurant: 'McDonald\'s Chamberí', revenue: 95000, growth: 3.2, efficiency: 80, satisfaction: 3.9 }
    ];

    // Tendencias financieras mensuales
    const financialTrends = Array.from({ length: 12 }, (_, i) => {
      const month = format(subDays(new Date(), (11 - i) * 30), 'MMM', { locale: es });
      const revenue = Math.floor(Math.random() * 200000 + 300000);
      const costs = Math.floor(revenue * (0.7 + Math.random() * 0.1));
      return {
        month,
        revenue,
        costs,
        profit: revenue - costs,
        margin: ((revenue - costs) / revenue * 100)
      };
    });

    // Comparación de franquiciados
    const franchiseeComparison = [
      { franchisee: 'Juan Pérez S.L.', totalRevenue: 450000, avgGrowth: 8.2, restaurantCount: 3, performance: 87 },
      { franchisee: 'María García e Hijos', totalRevenue: 380000, avgGrowth: 5.8, restaurantCount: 2, performance: 82 },
      { franchisee: 'Inversiones Madrid S.A.', totalRevenue: 620000, avgGrowth: 12.1, restaurantCount: 4, performance: 91 },
      { franchisee: 'Grupo Alimentario BCN', totalRevenue: 295000, avgGrowth: 3.5, restaurantCount: 2, performance: 75 }
    ];

    // Distribución geográfica
    const geographicDistribution = [
      { region: 'Madrid Centro', count: 8, revenue: 890000, color: '#dc2626' },
      { region: 'Madrid Norte', count: 5, revenue: 520000, color: '#ea580c' },
      { region: 'Barcelona', count: 6, revenue: 645000, color: '#ca8a04' },
      { region: 'Valencia', count: 4, revenue: 380000, color: '#65a30d' },
      { region: 'Sevilla', count: 3, revenue: 285000, color: '#059669' }
    ];

    setReportData({
      performanceMetrics,
      financialTrends,
      franchiseeComparison,
      geographicDistribution
    });
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Por ahora usamos datos simulados
      generateMockData();
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Error al cargar los datos del reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange, selectedRegion]);

  const exportToPDF = () => {
    toast.success('Exportando reporte a PDF...');
    // Implementar exportación a PDF
  };

  const exportToExcel = () => {
    toast.success('Exportando reporte a Excel...');
    // Implementar exportación a Excel
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getPerformanceColor = (value: number, threshold = 80) => {
    if (value >= threshold) return 'text-success';
    if (value >= threshold * 0.7) return 'text-warning';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes Avanzados</h1>
          <p className="text-muted-foreground">Análisis detallado y métricas personalizables</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Ingresos</SelectItem>
              <SelectItem value="growth">Crecimiento</SelectItem>
              <SelectItem value="efficiency">Eficiencia</SelectItem>
              <SelectItem value="satisfaction">Satisfacción</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las regiones</SelectItem>
              <SelectItem value="madrid">Madrid</SelectItem>
              <SelectItem value="barcelona">Barcelona</SelectItem>
              <SelectItem value="valencia">Valencia</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            Financiero
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Comparativas
          </TabsTrigger>
          <TabsTrigger value="geographic" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Geográfico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Análisis de Rendimiento por Restaurante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={reportData.performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="efficiency" 
                    name="Eficiencia %" 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    dataKey="revenue" 
                    name="Ingresos" 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(Number(value)) : `${value}%`,
                      name === 'revenue' ? 'Ingresos' : 'Eficiencia'
                    ]}
                    labelFormatter={(label) => `Restaurante: ${label}`}
                  />
                  <Scatter 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Top Restaurantes por Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.performanceMetrics
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((restaurant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{restaurant.restaurant}</p>
                          <p className="text-sm text-muted-foreground">
                            Eficiencia: {restaurant.efficiency}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(restaurant.revenue)}</p>
                        <Badge variant={restaurant.growth >= 0 ? "default" : "destructive"}>
                          {restaurant.growth > 0 ? '+' : ''}{restaurant.growth}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Métricas de Satisfacción</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reportData.performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="restaurant" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="satisfaction" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tendencias Financieras Anuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={reportData.financialTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.8}
                    name="Ingresos"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costs" 
                    stackId="2"
                    stroke="hsl(var(--destructive))" 
                    fill="hsl(var(--destructive))"
                    fillOpacity={0.8}
                    name="Costos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Márgenes de Beneficio</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={reportData.financialTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value) => `${Number(value).toFixed(1)}%`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="margin" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--success))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(reportData.financialTrends.reduce((sum, item) => sum + item.revenue, 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(reportData.financialTrends.reduce((sum, item) => sum + item.profit, 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Beneficio Total</p>
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">
                    {(reportData.financialTrends.reduce((sum, item) => sum + item.margin, 0) / reportData.financialTrends.length).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Margen Promedio</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Comparativa de Franquiciados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.franchiseeComparison.map((franchisee, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{franchisee.franchisee}</h3>
                        <p className="text-muted-foreground">
                          {franchisee.restaurantCount} restaurante{franchisee.restaurantCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
                        <div className="text-center">
                          <p className="text-xl font-bold">{formatCurrency(franchisee.totalRevenue)}</p>
                          <p className="text-xs text-muted-foreground">Ingresos Totales</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xl font-bold ${getPerformanceColor(franchisee.avgGrowth, 5)}`}>
                            {franchisee.avgGrowth > 0 ? '+' : ''}{franchisee.avgGrowth}%
                          </p>
                          <p className="text-xs text-muted-foreground">Crecimiento</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-xl font-bold ${getPerformanceColor(franchisee.performance)}`}>
                            {franchisee.performance}%
                          </p>
                          <p className="text-xs text-muted-foreground">Rendimiento</p>
                        </div>
                        <div className="text-center">
                          <Badge variant={franchisee.performance >= 85 ? "default" : franchisee.performance >= 70 ? "secondary" : "destructive"}>
                            {franchisee.performance >= 85 ? 'Excelente' : 
                             franchisee.performance >= 70 ? 'Bueno' : 'Mejorable'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Distribución por Región
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.geographicDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.geographicDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Ingresos por Región</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.geographicDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="region" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Detalle por Región</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {reportData.geographicDistribution.map((region, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: region.color }}
                      ></div>
                      <h3 className="font-semibold">{region.region}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Restaurantes:</span>
                        <span className="font-medium">{region.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ingresos:</span>
                        <span className="font-medium">{formatCurrency(region.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Promedio:</span>
                        <span className="font-medium">
                          {formatCurrency(region.revenue / region.count)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
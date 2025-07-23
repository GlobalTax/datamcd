
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, PieChart, Download } from 'lucide-react';

const AnalysisPage: React.FC = () => {
  return (
    <StandardLayout
      title="Análisis de Datos"
      description="Análisis avanzado de rendimiento y métricas financieras"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€1,234,567</div>
              <p className="text-xs text-muted-foreground">+20.1% vs mes anterior</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margen Operativo</CardTitle>
              <PieChart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.5%</div>
              <p className="text-xs text-muted-foreground">+2.3% vs mes anterior</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI Promedio</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.2%</div>
              <p className="text-xs text-muted-foreground">+1.8% vs mes anterior</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Análisis por Restaurante</span>
                <Badge variant="outline">12 restaurantes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">Gráfico de análisis por restaurante</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tendencias Mensuales</span>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">Gráfico de tendencias mensuales</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardLayout>
  );
};

export default AnalysisPage;

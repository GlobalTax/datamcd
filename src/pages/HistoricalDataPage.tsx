
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, TrendingUp, Calendar, Download } from 'lucide-react';

const HistoricalDataPage: React.FC = () => {
  return (
    <StandardLayout
      title="Datos Históricos"
      description="Análisis histórico de P&L y métricas operativas"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Años Disponibles</CardTitle>
              <Database className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">2019-2024</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos 2023</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€11,250,000</div>
              <p className="text-xs text-muted-foreground">+8.5% vs 2022</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mejor Año</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2023</div>
              <p className="text-xs text-muted-foreground">Mejor rendimiento</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+6.2%</div>
              <p className="text-xs text-muted-foreground">CAGR 2019-2024</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pnl" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pnl">P&L Histórico</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="comparison">Comparación</TabsTrigger>
            <TabsTrigger value="projections">Proyecciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pnl" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>P&L Histórico por Año</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">2019-2024</Badge>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Gráfico P&L histórico</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Tendencias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Gráfico de tendencias</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Comparación Interanual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['2024 vs 2023', '2023 vs 2022', '2022 vs 2021'].map((comparison) => (
                    <div key={comparison} className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">{comparison}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-green-600">+8.5%</Badge>
                        <span className="text-sm text-muted-foreground">Ingresos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Proyecciones Futuras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Gráfico de proyecciones</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StandardLayout>
  );
};

export default HistoricalDataPage;

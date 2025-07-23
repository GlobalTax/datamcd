
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const AnnualBudgetPage: React.FC = () => {
  return (
    <StandardLayout
      title="Presupuestos Anuales"
      description="Gestión y seguimiento de presupuestos anuales"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto 2024</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€12,450,000</div>
              <p className="text-xs text-muted-foreground">Presupuesto aprobado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ejecutado</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€8,320,000</div>
              <p className="text-xs text-muted-foreground">66.8% del presupuesto</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desviación</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2.3%</div>
              <p className="text-xs text-muted-foreground">vs presupuesto</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">En Línea</div>
              <p className="text-xs text-muted-foreground">Objetivos cumplidos</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="restaurants">Por Restaurante</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resumen Anual 2024</span>
                  <Badge variant="outline">Julio 2024</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Gráfico de resumen anual</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolución Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Gráfico de evolución mensual</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análisis por Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Personal', 'Alquiler', 'Materias Primas', 'Marketing', 'Otros'].map((category) => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{category}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">65%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="restaurants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Presupuesto por Restaurante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((restaurant) => (
                    <div key={restaurant} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Restaurante Madrid Centro #{restaurant}</p>
                        <p className="text-sm text-muted-foreground">Calle Gran Vía, 123</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{(1000 + restaurant * 50).toLocaleString()},000</p>
                        <p className="text-sm text-green-600">+{restaurant}.2% vs objetivo</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StandardLayout>
  );
};

export default AnnualBudgetPage;

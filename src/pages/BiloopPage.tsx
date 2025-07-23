
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, TrendingUp, Clock, Download } from 'lucide-react';

const BiloopPage: React.FC = () => {
  return (
    <StandardLayout
      title="Biloop Integration"
      description="Datos de POS y análisis de ventas desde Biloop"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€24,580</div>
              <p className="text-xs text-muted-foreground">Todas las ubicaciones</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+8.3% vs ayer</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€19.70</div>
              <p className="text-xs text-muted-foreground">+€1.20 vs ayer</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Sync</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14:32</div>
              <p className="text-xs text-muted-foreground">Hace 3 minutos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ventas por Restaurante</span>
                <Badge variant="outline">Hoy</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((restaurant) => (
                  <div key={restaurant} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Restaurante Madrid Centro #{restaurant}</p>
                      <p className="text-sm text-muted-foreground">
                        {180 + restaurant * 25} transacciones
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€{(4500 + restaurant * 800).toLocaleString()}</p>
                      <Badge variant="outline" className="text-green-600">
                        +{restaurant + 5}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Productos Más Vendidos</span>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Reporte
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Big Mac', sales: '€12,450', units: '1,247' },
                  { name: 'Papas Grandes', sales: '€8,920', units: '892' },
                  { name: 'Coca-Cola', sales: '€6,780', units: '1,356' },
                  { name: 'McNuggets', sales: '€5,340', units: '534' },
                  { name: 'Quarter Pounder', sales: '€4,890', units: '326' },
                ].map((product) => (
                  <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.units} unidades</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{product.sales}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardLayout>
  );
};

export default BiloopPage;

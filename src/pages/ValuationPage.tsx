
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, Building, TrendingUp, FileText } from 'lucide-react';

const ValuationPage: React.FC = () => {
  return (
    <StandardLayout
      title="Valoración Patrimonial"
      description="Valoración de activos y patrimonio de restaurantes"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <Calculator className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€8,450,000</div>
              <p className="text-xs text-muted-foreground">Valoración actual</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inmuebles</CardTitle>
              <Building className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€6,200,000</div>
              <p className="text-xs text-muted-foreground">Valor inmobiliario</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goodwill</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€2,250,000</div>
              <p className="text-xs text-muted-foreground">Valor intangible</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Tasación</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Mar 2024</div>
              <p className="text-xs text-muted-foreground">Hace 4 meses</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Valoración por Restaurante</span>
              <div className="flex gap-2">
                <Badge variant="outline">12 restaurantes</Badge>
                <Button variant="outline" size="sm">
                  Nueva Tasación
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((restaurant) => (
                <div key={restaurant} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Restaurante Madrid Centro #{restaurant}</p>
                      <p className="text-sm text-muted-foreground">Calle Gran Vía, 123</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€{(650 + restaurant * 50).toLocaleString()},000</p>
                    <p className="text-sm text-muted-foreground">Última tasación: Feb 2024</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardLayout>
  );
};

export default ValuationPage;

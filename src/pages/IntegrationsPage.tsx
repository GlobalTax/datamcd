
import React from 'react';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plug, CheckCircle, AlertTriangle, Settings } from 'lucide-react';

const IntegrationsPage: React.FC = () => {
  const integrations = [
    { name: 'Orquest API', status: 'connected', description: 'Gestión de turnos y personal' },
    { name: 'Biloop', status: 'connected', description: 'Datos de POS y ventas' },
    { name: 'Payroll Provider', status: 'warning', description: 'Integración de nómina' },
    { name: 'Real Estate DB', status: 'disconnected', description: 'Valoraciones inmobiliarias' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="outline" className="text-green-600 border-green-300">Conectado</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Advertencia</Badge>;
      case 'disconnected':
        return <Badge variant="outline" className="text-red-600 border-red-300">Desconectado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <StandardLayout
      title="Integraciones Externas"
      description="Gestión de conexiones con sistemas externos"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Integraciones</CardTitle>
              <Plug className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Sistemas conectados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Funcionando correctamente</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Advertencias</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desconectadas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">No disponibles</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estado de Integraciones</span>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Plug className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(integration.status)}
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
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

export default IntegrationsPage;

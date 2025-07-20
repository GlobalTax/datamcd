
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Wifi, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Truck,
  Calculator,
  Users,
  ShoppingCart
} from 'lucide-react';
import { IntegrationStatusDashboard } from '@/components/integrations/IntegrationStatusDashboard';
import { OrquestIntegrationConfig } from '@/components/integrations/OrquestIntegrationConfig';
import { POSIntegrationConfig } from '@/components/integrations/POSIntegrationConfig';
import { AccountingIntegrationConfig } from '@/components/integrations/AccountingIntegrationConfig';
import { DeliveryIntegrationConfig } from '@/components/integrations/DeliveryIntegrationConfig';

export const IntegrationsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('dashboard');

  const integrationTypes = [
    {
      id: 'orquest',
      name: 'Orquest (Planificación)',
      icon: Users,
      description: 'Gestión de horarios y personal',
      status: 'connected',
      lastSync: '2024-01-20 10:30'
    },
    {
      id: 'pos',
      name: 'Sistema POS',
      icon: ShoppingCart,
      description: 'Punto de venta y transacciones',
      status: 'disconnected',
      lastSync: null
    },
    {
      id: 'accounting',
      name: 'Contabilidad',
      icon: Calculator,
      description: 'Quantum, Sage, otros sistemas',
      status: 'warning',
      lastSync: '2024-01-19 15:45'
    },
    {
      id: 'delivery',
      name: 'Delivery Apps',
      icon: Truck,
      description: 'Uber Eats, Deliveroo, Glovo',
      status: 'disconnected',
      lastSync: null
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'disconnected':
        return <Wifi className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Advertencia</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Desconectado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integraciones</h1>
          <p className="text-muted-foreground">
            Conecta tus sistemas externos para sincronizar datos automáticamente
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">Estado de Conexiones</span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orquest">Orquest</TabsTrigger>
          <TabsTrigger value="pos">Sistema POS</TabsTrigger>
          <TabsTrigger value="accounting">Contabilidad</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <IntegrationStatusDashboard integrations={integrationTypes} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrationTypes.map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                      {getStatusIcon(integration.status)}
                    </div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getStatusBadge(integration.status)}
                      {integration.lastSync && (
                        <div className="text-xs text-muted-foreground">
                          Última sync: {integration.lastSync}
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedTab(integration.id)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="orquest">
          <OrquestIntegrationConfig />
        </TabsContent>

        <TabsContent value="pos">
          <POSIntegrationConfig />
        </TabsContent>

        <TabsContent value="accounting">
          <AccountingIntegrationConfig />
        </TabsContent>

        <TabsContent value="delivery">
          <DeliveryIntegrationConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsPage;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Users,
  ShoppingCart,
  Calculator,
  Truck,
  RefreshCw
} from 'lucide-react';
import { useFranchiseeContext } from '@/contexts/FranchiseeContext';

interface IntegrationStatus {
  id: string;
  name: string;
  icon: any;
  status: 'connected' | 'warning' | 'disconnected';
  lastSync: string | null;
  description: string;
  syncCount?: number;
  errorCount?: number;
}

const IntegrationStatusPage: React.FC = () => {
  const { selectedFranchisee } = useFranchiseeContext();
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulación de datos de integración para el franquiciado
  useEffect(() => {
    const loadIntegrationStatus = async () => {
      // En una implementación real, esto vendría de la API
      const mockData: IntegrationStatus[] = [
        {
          id: 'orquest',
          name: 'Orquest (Planificación)',
          icon: Users,
          status: 'connected',
          lastSync: '2024-01-20 10:30',
          description: 'Sincronización de horarios y personal',
          syncCount: 156,
          errorCount: 0
        },
        {
          id: 'pos',
          name: 'Sistema POS',
          icon: ShoppingCart,
          status: 'warning',
          lastSync: '2024-01-19 15:45',
          description: 'Punto de venta - Algunas transacciones pendientes',
          syncCount: 1250,
          errorCount: 3
        },
        {
          id: 'accounting',
          name: 'Contabilidad (Quantum)',
          icon: Calculator,
          status: 'connected',
          lastSync: '2024-01-20 09:15',
          description: 'Sincronización contable automática',
          syncCount: 89,
          errorCount: 0
        },
        {
          id: 'biloop',
          name: 'Biloop (Facturación)',
          icon: Database,
          status: 'disconnected',
          lastSync: null,
          description: 'Sistema de facturación - Pendiente configuración',
          syncCount: 0,
          errorCount: 1
        }
      ];

      setIntegrations(mockData);
      setLoading(false);
    };

    loadIntegrationStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'disconnected':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
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

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalCount = integrations.length;
  const alertsCount = integrations.filter(i => i.status === 'warning' || i.status === 'disconnected').length;

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando estado de integraciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estado de Integraciones</h1>
          <p className="text-muted-foreground">
            {selectedFranchisee 
              ? `Integraciones de ${selectedFranchisee.franchisee_name}`
              : 'Monitorea el estado de sincronización de tus sistemas externos'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">{connectedCount}/{totalCount} Conectados</span>
        </div>
      </div>

      {/* Resumen de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado General</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}/{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              Integraciones activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sincronizaciones Hoy</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, int) => sum + (int.syncCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Registros sincronizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            {alertsCount > 0 ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertsCount}</div>
            <p className="text-xs text-muted-foreground">
              {alertsCount === 0 ? 'Todo funcionando bien' : 'Requieren atención'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Integraciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const IconComponent = integration.icon;
          return (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                    {getStatusIcon(integration.status)}
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integration.lastSync && (
                    <div className="text-xs text-muted-foreground">
                      Última sync: {integration.lastSync}
                    </div>
                  )}
                  {integration.syncCount !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span>Registros sincronizados:</span>
                      <span className="font-medium">{integration.syncCount}</span>
                    </div>
                  )}
                  {integration.errorCount !== undefined && integration.errorCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Errores:</span>
                      <span className="font-medium text-red-600">{integration.errorCount}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas importantes */}
      {alertsCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hay {alertsCount} integración(es) que requieren atención. Contacta con el equipo de soporte si los problemas persisten.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default IntegrationStatusPage;

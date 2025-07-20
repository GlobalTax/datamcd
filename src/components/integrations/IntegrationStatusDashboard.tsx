
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Database
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  status: string;
  lastSync: string | null;
}

interface IntegrationStatusDashboardProps {
  integrations: Integration[];
}

export const IntegrationStatusDashboard: React.FC<IntegrationStatusDashboardProps> = ({ 
  integrations 
}) => {
  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalCount = integrations.length;
  const connectionPercentage = (connectedCount / totalCount) * 100;

  const recentSyncs = integrations
    .filter(i => i.lastSync)
    .sort((a, b) => new Date(b.lastSync!).getTime() - new Date(a.lastSync!).getTime())
    .slice(0, 3);

  const alertsCount = integrations.filter(i => i.status === 'warning' || i.status === 'disconnected').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado General</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{connectedCount}/{totalCount}</div>
          <p className="text-xs text-muted-foreground">
            Integraciones conectadas
          </p>
          <Progress value={connectionPercentage} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Última Sincronización</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {recentSyncs.length > 0 ? (
            <div className="space-y-2">
              {recentSyncs.map((sync) => (
                <div key={sync.id} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{sync.name}</span>
                  <span className="text-muted-foreground">{sync.lastSync}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No hay sincronizaciones recientes
            </div>
          )}
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
          {alertsCount > 0 && (
            <div className="mt-2 space-y-1">
              {integrations
                .filter(i => i.status === 'warning' || i.status === 'disconnected')
                .map((integration) => (
                  <div key={integration.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {integration.name}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

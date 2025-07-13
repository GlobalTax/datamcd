import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrquestServicesTable } from './OrquestServicesTable';
import { OrquestConfigDialog } from './OrquestConfigDialog';
import { useOrquest } from '@/hooks/useOrquest';
import { RefreshCw, Settings, MapPin } from 'lucide-react';

export const OrquestDashboard: React.FC = () => {
  const { services, loading, syncWithOrquest } = useOrquest();
  const [configOpen, setConfigOpen] = React.useState(false);

  const handleSync = async () => {
    await syncWithOrquest();
  };

  const activeServices = services.filter(s => s.datos_completos !== null);
  const totalServices = services.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orquest</h1>
          <p className="text-muted-foreground">
            Gestión y sincronización de servicios Orquest
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setConfigOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button
            onClick={handleSync}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Servicios
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">
              Servicios registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Servicios Activos
            </CardTitle>
            <Badge variant="default" className="h-4 w-4 rounded-full p-0 bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeServices.length}</div>
            <p className="text-xs text-muted-foreground">
              Con datos completos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Última Sync
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.length > 0 && services[0]?.updated_at 
                ? new Date(services[0].updated_at).toLocaleDateString()
                : 'Nunca'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Última actualización
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Servicios Orquest</CardTitle>
          <CardDescription>
            Lista de todos los servicios sincronizados con Orquest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrquestServicesTable services={services} loading={loading} />
        </CardContent>
      </Card>

      <OrquestConfigDialog 
        open={configOpen} 
        onOpenChange={setConfigOpen} 
      />
    </div>
  );
};
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrquestServicesTable } from './OrquestServicesTable';
import { OrquestEmployeesTable } from './OrquestEmployeesTable';
import { OrquestConfigDialog } from './OrquestConfigDialog';
import { useOrquest } from '@/hooks/useOrquest';
import { useOrquestConfig } from '@/hooks/useOrquestConfig';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { RefreshCw, Settings, MapPin, Users, AlertCircle } from 'lucide-react';

export const OrquestDashboard: React.FC = () => {
  const { franchisee } = useUnifiedAuth();
  const franchiseeId = franchisee?.id;
  
  const { services, employees, loading, syncWithOrquest, syncEmployeesOnly } = useOrquest(franchiseeId);
  const { isConfigured } = useOrquestConfig(franchiseeId);
  const [configOpen, setConfigOpen] = React.useState(false);

  const handleSync = async () => {
    await syncWithOrquest();
  };

  const handleSyncEmployees = async () => {
    await syncEmployeesOnly();
  };

  const activeServices = services.filter(s => s.datos_completos !== null);
  const totalServices = services.length;
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.estado === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orquest</h1>
          <p className="text-muted-foreground">
            Sincronización con API de McDonald's España (PRE-MCD)
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
            variant="outline"
            onClick={handleSyncEmployees}
            disabled={loading || !isConfigured()}
          >
            <Users className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync Empleados
          </Button>
          <Button
            onClick={handleSync}
            disabled={loading || !isConfigured()}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar Todo
          </Button>
        </div>
      </div>

      {!isConfigured() && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-800">Configuración requerida</h3>
                <p className="text-sm text-amber-700">
                  Debes configurar las credenciales de Orquest antes de poder sincronizar datos.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigOpen(true)}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar Ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
              Total Empleados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Empleados sincronizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empleados Activos
            </CardTitle>
            <Badge variant="default" className="h-4 w-4 rounded-full p-0 bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Estado activo
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

      <Card>
        <CardHeader>
          <CardTitle>Empleados Orquest</CardTitle>
          <CardDescription>
            Lista de todos los empleados sincronizados con Orquest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrquestEmployeesTable employees={employees} loading={loading} />
        </CardContent>
      </Card>

      <OrquestConfigDialog 
        open={configOpen} 
        onOpenChange={setConfigOpen}
        franchiseeId={franchiseeId}
      />
    </div>
  );
};
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrquestServicesTable } from './OrquestServicesTable';
import { OrquestEmployeesTable } from './OrquestEmployeesTable';
import { OrquestMeasuresTable } from './OrquestMeasuresTable';
import { OrquestConfigDialog } from './OrquestConfigDialog';
import { useOrquest } from '@/hooks/useOrquest';
import { useOrquestConfig } from '@/hooks/useOrquestConfig';
import { useOrquestMeasuresExtended } from '@/hooks/useOrquestMeasuresExtended';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { RefreshCw, Settings, MapPin, Users, AlertCircle, BarChart3 } from 'lucide-react';

export const OrquestDashboard: React.FC = () => {
  const { franchisee } = useUnifiedAuth();
  const franchiseeId = franchisee?.id;
  
  // Detectar si estamos en modo fallback
  const isInFallbackMode = franchiseeId?.startsWith('fallback-') || false;
  const isValidUUID = franchiseeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(franchiseeId);
  const canSaveConfig = franchiseeId && isValidUUID && !isInFallbackMode;
  
  const { services, employees, loading, syncWithOrquest, syncEmployeesOnly } = useOrquest(franchiseeId);
  const { isConfigured } = useOrquestConfig(franchiseeId);
  const { 
    measures: extendedMeasures, 
    measureTypes, 
    loading: extendedMeasuresLoading,
    syncMeasuresFromOrquest,
    formatMeasureValue,
    getMeasureDisplayName
  } = useOrquestMeasuresExtended(franchiseeId);
  const [configOpen, setConfigOpen] = React.useState(false);
  const [selectedServiceId, setSelectedServiceId] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<string>(new Date().toISOString().split('T')[0]);

  const handleSync = async () => {
    await syncWithOrquest();
    // Refrescar medidas también después de sincronizar servicios/empleados
    setTimeout(async () => {
      if (selectedServiceId && selectedDate) {
        await syncMeasuresFromOrquest(selectedServiceId, selectedDate);
      }
    }, 1000);
  };

  const handleSyncEmployees = async () => {
    await syncEmployeesOnly();
  };

  const handleSyncMeasures = async () => {
    if (selectedServiceId && selectedDate) {
      await syncMeasuresFromOrquest(selectedServiceId, selectedDate);
    }
  };

  const activeServices = services.filter(s => s.datos_completos !== null);
  const totalServices = services.length;
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.estado === 'active').length;
  const totalMeasures = extendedMeasures.length;

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

      {isInFallbackMode && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Modo de conectividad limitada</h3>
                <p className="text-sm text-red-700">
                  Hay problemas de conectividad. Algunas funciones como guardar configuración están deshabilitadas. 
                  Por favor, verifica tu conexión a internet e intenta recargar la página.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isInFallbackMode && !isConfigured() && (
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
                disabled={!canSaveConfig}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar Ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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
              Medidas
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeasures}</div>
            <p className="text-xs text-muted-foreground">
              Registros sincronizados
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

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="measures">Medidas</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
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
        </TabsContent>

        <TabsContent value="employees">
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
        </TabsContent>

        <TabsContent value="measures">
          <Card>
            <CardHeader>
              <CardTitle>Medidas Orquest</CardTitle>
              <CardDescription>
                Gestión de medidas y KPIs sincronizados con Orquest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrquestMeasuresTable 
                measures={extendedMeasures}
                measureTypes={measureTypes}
                services={activeServices}
                loading={extendedMeasuresLoading}
                onSyncFromOrquest={handleSyncMeasures}
                selectedServiceId={selectedServiceId}
                setSelectedServiceId={setSelectedServiceId}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OrquestConfigDialog
        open={configOpen} 
        onOpenChange={setConfigOpen}
        franchiseeId={franchiseeId}
      />
    </div>
  );
};
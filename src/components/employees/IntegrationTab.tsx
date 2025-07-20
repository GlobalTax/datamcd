
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Download, 
  Plus, 
  Building2, 
  Database,
  FileText,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface IntegrationTabProps {
  restaurantId: string;
  restaurantName: string;
}

export const IntegrationTab: React.FC<IntegrationTabProps> = ({
  restaurantId,
  restaurantName
}) => {
  const [loading, setLoading] = useState(false);

  // Datos simulados de integración
  const integrationStatus = {
    orquest: {
      connected: true,
      lastSync: '2025-01-20 14:30',
      employees: 12,
      pendingActions: 2
    },
    biloop: {
      connected: false,
      lastSync: null,
      employees: 0,
      pendingActions: 0
    }
  };

  const handleSyncOrquest = async () => {
    setLoading(true);
    // Simular sincronización
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleConnectBiloop = async () => {
    setLoading(true);
    // Simular conexión
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Estado general de integraciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Orquest
              </CardTitle>
              <CardDescription>Sistema de planificación horaria</CardDescription>
            </div>
            <Badge variant={integrationStatus.orquest.connected ? "default" : "secondary"}>
              {integrationStatus.orquest.connected ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Conectado
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Desconectado
                </>
              )}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{integrationStatus.orquest.employees}</div>
                <div className="text-sm text-muted-foreground">Empleados</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{integrationStatus.orquest.pendingActions}</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
            </div>
            {integrationStatus.orquest.lastSync && (
              <p className="text-xs text-muted-foreground">
                Última sincronización: {integrationStatus.orquest.lastSync}
              </p>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={handleSyncOrquest}
                disabled={loading}
                size="sm"
                className="flex-1"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                IntegraLOOP (Biloop)
              </CardTitle>
              <CardDescription>Sistema de gestión laboral</CardDescription>
            </div>
            <Badge variant={integrationStatus.biloop.connected ? "default" : "secondary"}>
              {integrationStatus.biloop.connected ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Conectado
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Desconectado
                </>
              )}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{integrationStatus.biloop.employees}</div>
                <div className="text-sm text-muted-foreground">Empleados</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{integrationStatus.biloop.pendingActions}</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
            </div>
            {!integrationStatus.biloop.connected ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  No conectado. Configure las credenciales para comenzar.
                </p>
                <Button 
                  onClick={handleConnectBiloop}
                  disabled={loading}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Configurar Conexión
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleConnectBiloop}
                  disabled={loading}
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Sincronizar
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pestañas de gestión de integraciones */}
      <Tabs defaultValue="orquest" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orquest">Orquest</TabsTrigger>
          <TabsTrigger value="biloop">Biloop</TabsTrigger>
          <TabsTrigger value="actions">Acciones</TabsTrigger>
        </TabsList>

        <TabsContent value="orquest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Orquest</CardTitle>
              <CardDescription>
                Empleados y horarios sincronizados desde Orquest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Datos de Orquest se mostrarán aquí después de la sincronización</p>
                <p className="text-sm">Empleados, horarios y turnos asignados</p>
                <Button className="mt-4" onClick={handleSyncOrquest} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Sincronizar Ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biloop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Biloop</CardTitle>
              <CardDescription>
                Información laboral desde IntegraLOOP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Configure la conexión con Biloop para ver los datos</p>
                <p className="text-sm">Contratos, nóminas y datos laborales</p>
                <Button className="mt-4" onClick={handleConnectBiloop} disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Configurar Conexión
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Exportar Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar a A3NOM
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar a Excel
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Informe
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Sincronización
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar Todo
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  Solo Orquest
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Solo Biloop
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

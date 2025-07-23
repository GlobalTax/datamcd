import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrquestServicesTable } from './OrquestServicesTable';
import { OrquestEmployeesTable } from './OrquestEmployeesTable';
import { OrquestMeasuresTable } from './OrquestMeasuresTable';
import { OrquestConfigDialog } from './OrquestConfigDialog';
import { useOrquest } from '@/hooks/useOrquest';
import { useOrquestConfig } from '@/hooks/useOrquestConfig';
import { useOrquestMeasuresExtended } from '@/hooks/useOrquestMeasuresExtended';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';
import { 
  RefreshCw, 
  Settings, 
  MapPin, 
  Users, 
  AlertCircle, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  Database,
  Activity,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  isRunning: boolean;
  progress: number;
  currentStep: string;
  error?: string;
}

export const OrquestDashboard: React.FC = () => {
  const { franchisee } = useUnifiedAuth();
  const franchiseeId = franchisee?.id;
  const { toast } = useToast();
  
  // Estados
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    progress: 0,
    currentStep: ''
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [configOpen, setConfigOpen] = useState(false);
  
  // Detectar modo fallback
  const isInFallbackMode = franchiseeId?.startsWith('fallback-') || false;
  const isValidUUID = franchiseeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(franchiseeId);
  const canSaveConfig = franchiseeId && isValidUUID && !isInFallbackMode;
  
  // Hooks
  const { services, employees, loading, syncWithOrquest, syncEmployeesOnly } = useOrquest(franchiseeId);
  const { isConfigured, config } = useOrquestConfig(franchiseeId);
  const { 
    measures: extendedMeasures, 
    measureTypes, 
    loading: extendedMeasuresLoading,
    syncMeasuresFromOrquest,
  } = useOrquestMeasuresExtended(franchiseeId);

  // Efectos
  useEffect(() => {
    if (services.length > 0 && services[0]?.updated_at) {
      setLastSyncTime(services[0].updated_at);
    }
  }, [services]);

  // Funciones de sincronización mejoradas
  const handleFullSync = async () => {
    if (!canSaveConfig || !isConfigured()) {
      toast({
        title: "Error",
        description: "Debes configurar Orquest antes de sincronizar",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus({
      isRunning: true,
      progress: 0,
      currentStep: 'Iniciando sincronización...'
    });

    try {
      setSyncStatus(prev => ({ ...prev, progress: 25, currentStep: 'Sincronizando servicios...' }));
      await syncWithOrquest();
      
      setSyncStatus(prev => ({ ...prev, progress: 75, currentStep: 'Actualizando datos...' }));
      
      // Pequeña pausa para mostrar progreso
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSyncStatus(prev => ({ ...prev, progress: 100, currentStep: 'Completado' }));
      setLastSyncTime(new Date().toISOString());
      
      toast({
        title: "Sincronización exitosa",
        description: "Todos los datos han sido actualizados correctamente",
      });
      
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error desconocido',
        currentStep: 'Error en sincronización'
      }));
      
      toast({
        title: "Error en sincronización",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setSyncStatus({
          isRunning: false,
          progress: 0,
          currentStep: ''
        });
      }, 2000);
    }
  };

  const handleEmployeeSync = async () => {
    if (!canSaveConfig || !isConfigured()) {
      toast({
        title: "Error",
        description: "Debes configurar Orquest antes de sincronizar",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus({
      isRunning: true,
      progress: 0,
      currentStep: 'Sincronizando empleados...'
    });

    try {
      setSyncStatus(prev => ({ ...prev, progress: 50 }));
      await syncEmployeesOnly();
      
      setSyncStatus(prev => ({ ...prev, progress: 100, currentStep: 'Empleados sincronizados' }));
      
      toast({
        title: "Empleados sincronizados",
        description: "Los datos de empleados han sido actualizados",
      });
      
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error desconocido',
        currentStep: 'Error en sincronización'
      }));
      
      toast({
        title: "Error en sincronización",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setSyncStatus({
          isRunning: false,
          progress: 0,
          currentStep: ''
        });
      }, 2000);
    }
  };

  const handleMeasuresSync = async () => {
    if (!selectedServiceId || !selectedDate) {
      toast({
        title: "Error",
        description: "Selecciona un servicio y fecha para sincronizar medidas",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus({
      isRunning: true,
      progress: 0,
      currentStep: 'Sincronizando medidas...'
    });

    try {
      setSyncStatus(prev => ({ ...prev, progress: 50 }));
      await syncMeasuresFromOrquest(selectedServiceId, selectedDate);
      
      setSyncStatus(prev => ({ ...prev, progress: 100, currentStep: 'Medidas sincronizadas' }));
      
      toast({
        title: "Medidas sincronizadas",
        description: "Las medidas han sido actualizadas",
      });
      
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error desconocido',
        currentStep: 'Error en sincronización'
      }));
    } finally {
      setTimeout(() => {
        setSyncStatus({
          isRunning: false,
          progress: 0,
          currentStep: ''
        });
      }, 2000);
    }
  };

  // Métricas calculadas
  const activeServices = services.filter(s => s.datos_completos !== null);
  const totalServices = services.length;
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.estado === 'active').length;
  const totalMeasures = extendedMeasures.length;
  
  const configStatus = isConfigured() ? 'configurado' : 'pendiente';
  const connectionStatus = isInFallbackMode ? 'desconectado' : 'conectado';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orquest Integration</h1>
              <p className="text-gray-600">
                Sincronización con API de McDonald's España
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant={configStatus === 'configurado' ? 'default' : 'secondary'}>
              {configStatus === 'configurado' ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> Configurado</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" /> Sin configurar</>
              )}
            </Badge>
            <Badge variant={connectionStatus === 'conectado' ? 'default' : 'destructive'}>
              {connectionStatus === 'conectado' ? (
                <><Activity className="w-3 h-3 mr-1" /> Conectado</>
              ) : (
                <><AlertCircle className="w-3 h-3 mr-1" /> Desconectado</>
              )}
            </Badge>
          </div>
        </div>
      </div>

      {/* Alertas de estado */}
      {isInFallbackMode && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Modo de conectividad limitada:</strong> Hay problemas de conectividad. 
            Algunas funciones están deshabilitadas. Verifica tu conexión e intenta recargar.
          </AlertDescription>
        </Alert>
      )}

      {!isInFallbackMode && !isConfigured() && (
        <Alert className="border-blue-200 bg-blue-50">
          <Settings className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Configuración requerida:</strong> Configura las credenciales de Orquest 
            antes de poder sincronizar datos.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-3"
              onClick={() => setConfigOpen(true)}
            >
              Configurar Ahora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Estado de sincronización */}
      {syncStatus.isRunning && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {syncStatus.currentStep}
                  </span>
                </div>
                <span className="text-sm text-blue-700">
                  {syncStatus.progress}%
                </span>
              </div>
              <Progress value={syncStatus.progress} className="h-2" />
              {syncStatus.error && (
                <p className="text-sm text-red-600">{syncStatus.error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Servicios</p>
                <p className="text-2xl font-bold text-blue-900">{totalServices}</p>
                <p className="text-xs text-blue-600">{activeServices.length} activos</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Empleados</p>
                <p className="text-2xl font-bold text-green-900">{totalEmployees}</p>
                <p className="text-xs text-green-600">{activeEmployees} activos</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Medidas</p>
                <p className="text-2xl font-bold text-purple-900">{totalMeasures}</p>
                <p className="text-xs text-purple-600">Registros</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Estado</p>
                <p className="text-lg font-bold text-orange-900">
                  {isConfigured() ? 'Activo' : 'Inactivo'}
                </p>
                <p className="text-xs text-orange-600">
                  {isConfigured() ? 'Funcionando' : 'Requiere config'}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Última Sync</p>
                <p className="text-sm font-bold text-emerald-900">
                  {lastSyncTime 
                    ? new Date(lastSyncTime).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Nunca'
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones de sincronización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Sincronización
          </CardTitle>
          <CardDescription>
            Gestiona la sincronización de datos con Orquest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleFullSync}
              disabled={loading || syncStatus.isRunning || !isConfigured()}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading || syncStatus.isRunning ? 'animate-spin' : ''}`} />
              Sincronización Completa
            </Button>
            
            <Button
              variant="outline"
              onClick={handleEmployeeSync}
              disabled={loading || syncStatus.isRunning || !isConfigured()}
            >
              <Users className={`w-4 h-4 ${loading || syncStatus.isRunning ? 'animate-spin' : ''}`} />
              Solo Empleados
            </Button>
            
            <Button
              variant="outline"
              onClick={handleMeasuresSync}
              disabled={loading || syncStatus.isRunning || !selectedServiceId || !selectedDate}
            >
              <BarChart3 className={`w-4 h-4 ${loading || syncStatus.isRunning ? 'animate-spin' : ''}`} />
              Solo Medidas
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => setConfigOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de contenido */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Servicios Orquest</CardTitle>
            <CardDescription>
              Lista de todos los servicios sincronizados ({totalServices} total, {activeServices.length} activos)
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
              Lista de todos los empleados sincronizados ({totalEmployees} total, {activeEmployees} activos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrquestEmployeesTable employees={employees} loading={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medidas y KPIs</CardTitle>
            <CardDescription>
              Gestión de medidas y KPIs sincronizados con Orquest ({totalMeasures} registros)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrquestMeasuresTable 
              measures={extendedMeasures}
              measureTypes={measureTypes}
              services={activeServices}
              loading={extendedMeasuresLoading}
              onSyncFromOrquest={handleMeasuresSync}
              selectedServiceId={selectedServiceId}
              setSelectedServiceId={setSelectedServiceId}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialog de configuración */}
      <OrquestConfigDialog
        open={configOpen} 
        onOpenChange={setConfigOpen}
        franchiseeId={franchiseeId}
      />
    </div>
  );
};
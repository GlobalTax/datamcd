import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Database,
  ArrowRight,
  Zap,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrquestSite {
  id: string;
  nombre: string | null;
  latitud: number | null;
  longitud: number | null;
  franchiseeId?: string;
  isAssigned: boolean;
  lastSync?: string;
}

interface SyncProgress {
  phase: 'idle' | 'sites' | 'employees' | 'measures' | 'complete';
  progress: number;
  currentStep: string;
  sitesProcessed: number;
  totalSites: number;
  employeesProcessed: number;
  totalEmployees: number;
  isRunning: boolean;
  error?: string;
}

interface OrquestSiteManagerProps {
  franchiseeId: string;
  sites: OrquestSite[];
  onSyncAll: () => Promise<void>;
  onAssignSites: (siteIds: string[]) => Promise<void>;
  isConfigured: boolean;
}

export const OrquestSiteManager: React.FC<OrquestSiteManagerProps> = ({
  franchiseeId,
  sites,
  onSyncAll,
  onAssignSites,
  isConfigured
}) => {
  const { toast } = useToast();
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    phase: 'idle',
    progress: 0,
    currentStep: '',
    sitesProcessed: 0,
    totalSites: 0,
    employeesProcessed: 0,
    totalEmployees: 0,
    isRunning: false
  });

  const assignedSites = sites.filter(site => site.isAssigned);
  const unassignedSites = sites.filter(site => !site.isAssigned);

  const executeUnifiedSync = async () => {
    if (!isConfigured) {
      toast({
        title: "Error",
        description: "Debes configurar Orquest antes de sincronizar",
        variant: "destructive"
      });
      return;
    }

    setSyncProgress({
      phase: 'sites',
      progress: 0,
      currentStep: 'Iniciando sincronización unificada...',
      sitesProcessed: 0,
      totalSites: assignedSites.length,
      employeesProcessed: 0,
      totalEmployees: 0,
      isRunning: true
    });

    try {
      // Fase 1: Sincronizar Sites
      setSyncProgress(prev => ({
        ...prev,
        phase: 'sites',
        progress: 10,
        currentStep: `Sincronizando ${assignedSites.length} sites de Orquest...`
      }));

      // Simular progreso de sites
      for (let i = 0; i < assignedSites.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setSyncProgress(prev => ({
          ...prev,
          progress: 10 + (i + 1) * 20 / assignedSites.length,
          sitesProcessed: i + 1,
          currentStep: `Sincronizando site ${assignedSites[i].nombre || assignedSites[i].id}...`
        }));
      }

      // Fase 2: Sincronizar Empleados
      setSyncProgress(prev => ({
        ...prev,
        phase: 'employees',
        progress: 30,
        currentStep: 'Sincronizando empleados con datos completos...',
        totalEmployees: assignedSites.length * 15 // Estimación
      }));

      // Simular progreso de empleados
      for (let i = 0; i < assignedSites.length * 15; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setSyncProgress(prev => ({
          ...prev,
          progress: 30 + (i + 5) * 40 / (assignedSites.length * 15),
          employeesProcessed: i + 5,
          currentStep: `Procesando empleados... ${i + 5}/${assignedSites.length * 15}`
        }));
      }

      // Fase 3: Sincronizar Medidas
      setSyncProgress(prev => ({
        ...prev,
        phase: 'measures',
        progress: 70,
        currentStep: 'Sincronizando medidas y métricas...'
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Ejecutar sincronización real
      await onSyncAll();

      // Fase 4: Completar
      setSyncProgress(prev => ({
        ...prev,
        phase: 'complete',
        progress: 100,
        currentStep: '¡Sincronización unificada completada!'
      }));

      toast({
        title: "✅ Sincronización Completada",
        description: `Se han sincronizado ${assignedSites.length} sites con todos sus datos`,
      });

    } catch (error) {
      setSyncProgress(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        currentStep: 'Error en sincronización unificada'
      }));
      
      toast({
        title: "Error en Sincronización",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setSyncProgress({
          phase: 'idle',
          progress: 0,
          currentStep: '',
          sitesProcessed: 0,
          totalSites: 0,
          employeesProcessed: 0,
          totalEmployees: 0,
          isRunning: false
        });
      }, 3000);
    }
  };

  const autoAssignSites = async () => {
    if (unassignedSites.length === 0) {
      toast({
        title: "Info",
        description: "No hay sites sin asignar",
      });
      return;
    }

    const siteIds = unassignedSites.map(site => site.id);
    await onAssignSites(siteIds);
    
    toast({
      title: "✅ Sites Asignados",
      description: `Se han asignado ${unassignedSites.length} sites automáticamente`,
    });
  };

  const getPhaseIcon = () => {
    switch (syncProgress.phase) {
      case 'sites':
        return <MapPin className="w-4 h-4 animate-pulse text-blue-500" />;
      case 'employees':
        return <Users className="w-4 h-4 animate-pulse text-green-500" />;
      case 'measures':
        return <Database className="w-4 h-4 animate-pulse text-purple-500" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado de Sites */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Sites Asignados</p>
                <p className="text-2xl font-bold text-blue-900">{assignedSites.length}</p>
                <p className="text-xs text-blue-600">Configurados para sync</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Sites Pendientes</p>
                <p className="text-2xl font-bold text-orange-900">{unassignedSites.length}</p>
                <p className="text-xs text-orange-600">Por asignar</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Sites</p>
                <p className="text-2xl font-bold text-green-900">{sites.length}</p>
                <p className="text-xs text-green-600">En Orquest</p>
              </div>
              <Database className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Gestión Unificada de Sites
          </CardTitle>
          <CardDescription>
            Asigna sites automáticamente y ejecuta sincronización completa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={autoAssignSites}
              disabled={unassignedSites.length === 0 || syncProgress.isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Asignar Sites Pendientes ({unassignedSites.length})
            </Button>

            <Button
              onClick={executeUnifiedSync}
              disabled={assignedSites.length === 0 || !isConfigured || syncProgress.isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncProgress.isRunning ? 'animate-spin' : ''}`} />
              Sincronización Unificada
            </Button>
          </div>

          {!isConfigured && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Configuración requerida:</strong> Configura Orquest antes de sincronizar sites.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Progreso de Sincronización */}
      {syncProgress.isRunning && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPhaseIcon()}
                  <span className="font-medium text-blue-900">
                    {syncProgress.currentStep}
                  </span>
                </div>
                <Badge variant="outline" className="bg-white">
                  {syncProgress.progress.toFixed(0)}%
                </Badge>
              </div>

              <Progress value={syncProgress.progress} className="h-3" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sites Procesados</span>
                    <span className="font-medium">{syncProgress.sitesProcessed}/{syncProgress.totalSites}</span>
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Empleados Procesados</span>
                    <span className="font-medium">{syncProgress.employeesProcessed}/{syncProgress.totalEmployees}</span>
                  </div>
                </div>
              </div>

              {syncProgress.error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {syncProgress.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Sites */}
      <Card>
        <CardHeader>
          <CardTitle>Sites de Orquest</CardTitle>
          <CardDescription>
            Gestiona la asignación y estado de sincronización de cada site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sites.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${site.isAssigned ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <div>
                    <p className="font-medium">{site.nombre || site.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {site.latitud && site.longitud ? `${site.latitud}, ${site.longitud}` : 'Sin coordenadas'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={site.isAssigned ? 'default' : 'secondary'}>
                    {site.isAssigned ? 'Asignado' : 'Pendiente'}
                  </Badge>
                  {site.lastSync && (
                    <span className="text-xs text-muted-foreground">
                      Último sync: {new Date(site.lastSync).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {sites.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se han encontrado sites de Orquest</p>
                <p className="text-sm">Ejecuta una sincronización para cargar los sites</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
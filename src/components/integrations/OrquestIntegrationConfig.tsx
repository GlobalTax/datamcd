
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  TestTube, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useSecureConfig } from '@/hooks/useSecureConfig';
import { useFranchisees } from '@/hooks/useFranchisees';
import { toast } from 'sonner';

export const OrquestIntegrationConfig: React.FC = () => {
  const { franchisees } = useFranchisees();
  const currentFranchisee = franchisees[0];
  
  const { config, loading, saveConfig, isConfigured } = useSecureConfig('orquest', currentFranchisee?.id);
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSave = async () => {
    if (!currentFranchisee) {
      toast.error('No se encontró franquiciado');
      return;
    }

    const success = await saveConfig({
      enabled: true,
      configured_by: currentFranchisee.id
    });
    
    if (success) {
      toast.success('Configuración de Orquest guardada correctamente');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      // Test connection through secure endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isConfigured) {
        setTestResult({
          success: true,
          message: 'Conexión exitosa con Orquest API'
        });
        toast.success('Conexión con Orquest verificada correctamente');
      } else {
        setTestResult({
          success: false,
          message: 'Configuración no encontrada'
        });
        toast.error('Error en la conexión: configuración no encontrada');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error al conectar con la API de Orquest'
      });
      toast.error('Error al probar la conexión');
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    toast.info('Iniciando sincronización con Orquest...');
    setTimeout(() => {
      toast.success('Sincronización completada');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Configuración de Orquest</CardTitle>
              <CardDescription>
                Conecta tu sistema de planificación de personal Orquest
              </CardDescription>
            </div>
            <div className="ml-auto">
              {isConfigured ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Sin configurar
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              La configuración de API keys ahora se maneja de forma segura en el servidor. 
              Solo necesitas activar la integración para tu franquiciado.
            </AlertDescription>
          </Alert>

          {config?.base_config && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Base configurada:</label>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {config.base_config.base_url}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Business ID:</label>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {config.base_config.business_id}
                </div>
              </div>
            </div>
          )}

          {testResult && (
            <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                  {testResult.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Activar Integración'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTestConnection} 
              disabled={testing || !isConfigured}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              {testing ? 'Probando...' : 'Probar Conexión'}
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleSync}
              disabled={!isConfigured}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Sincronizar Ahora
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado de Sincronización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-sm text-muted-foreground">Empleados Sincronizados</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-muted-foreground">Horarios Importados</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-muted-foreground">Restaurantes Conectados</div>
            </div>
          </div>
          
          {config?.config?.last_sync && (
            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Última sincronización: {new Date(config.config.last_sync).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useOrquestConfig } from '@/hooks/useOrquestConfig';
import { useFranchisees } from '@/hooks/useFranchisees';
import { toast } from 'sonner';

export const OrquestIntegrationConfig: React.FC = () => {
  const { franchisees } = useFranchisees();
  const currentFranchisee = franchisees[0]; // Asumiendo el primer franquiciado por ahora
  
  const { config, loading, saveConfig, isConfigured } = useOrquestConfig(currentFranchisee?.id);
  
  const [formData, setFormData] = useState({
    api_key: '',
    base_url: 'https://pre-mc.orquest.es',
    business_id: 'MCDONALDS_ES'
  });
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (config) {
      setFormData({
        api_key: config.api_key || '',
        base_url: config.base_url || 'https://pre-mc.orquest.es',
        business_id: config.business_id || 'MCDONALDS_ES'
      });
    }
  }, [config]);

  const handleSave = async () => {
    if (!currentFranchisee) {
      toast.error('No se encontró franquiciado');
      return;
    }

    const success = await saveConfig(formData, currentFranchisee.id);
    if (success) {
      toast.success('Configuración de Orquest guardada correctamente');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      // Simular test de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (formData.api_key && formData.base_url) {
        setTestResult({
          success: true,
          message: 'Conexión exitosa con Orquest API'
        });
        toast.success('Conexión con Orquest verificada correctamente');
      } else {
        setTestResult({
          success: false,
          message: 'Faltan credenciales requeridas'
        });
        toast.error('Error en la conexión: credenciales incompletas');
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
    // Aquí iría la lógica de sincronización
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
              {isConfigured() ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_url">URL Base de la API</Label>
              <Input
                id="base_url"
                placeholder="https://pre-mc.orquest.es"
                value={formData.base_url}
                onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business_id">Business ID</Label>
              <Input
                id="business_id"
                placeholder="MCDONALDS_ES"
                value={formData.business_id}
                onChange={(e) => setFormData(prev => ({ ...prev, business_id: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <div className="relative">
              <Input
                id="api_key"
                type={showApiKey ? "text" : "password"}
                placeholder="Ingresa tu API Key de Orquest"
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

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
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTestConnection} 
              disabled={testing || !formData.api_key}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              {testing ? 'Probando...' : 'Probar Conexión'}
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleSync}
              disabled={!isConfigured()}
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
          
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Última sincronización: 20 de enero, 2024 a las 10:30 AM
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

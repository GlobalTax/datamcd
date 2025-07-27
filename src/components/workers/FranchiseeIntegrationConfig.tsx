import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, TestTube2, Save, Edit2, X, Check, AlertCircle } from 'lucide-react';
import { useIntegrationConfig } from '@/hooks/useIntegrationConfig';
import { useToast } from '@/hooks/use-toast';

interface FranchiseeIntegrationConfigProps {
  franchiseeId: string;
}

export const FranchiseeIntegrationConfig: React.FC<FranchiseeIntegrationConfigProps> = ({
  franchiseeId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState({
    orquest: {
      api_key: '',
      base_url: 'https://pre-mc.orquest.es',
      business_id: 'MCDONALDS_ES',
    },
    biloop: {
      company_id: '',
    }
  });
  const [connectionStatus, setConnectionStatus] = useState<{
    orquest?: 'testing' | 'success' | 'error';
    biloop?: 'testing' | 'success' | 'error';
  }>({});

  const { configs, loading, saveConfig, testConnection, getConfigStatus } = useIntegrationConfig(franchiseeId);
  const { toast } = useToast();

  React.useEffect(() => {
    const franchiseeConfig = configs[franchiseeId];
    if (franchiseeConfig) {
      setCurrentConfig({
        orquest: {
          api_key: franchiseeConfig.orquest?.api_key || '',
          base_url: franchiseeConfig.orquest?.base_url || 'https://pre-mc.orquest.es',
          business_id: franchiseeConfig.orquest?.business_id || 'MCDONALDS_ES',
        },
        biloop: {
          company_id: franchiseeConfig.biloop?.company_id || '',
        }
      });
    }
  }, [configs, franchiseeId]);

  const handleSaveConfig = async () => {
    const success = await saveConfig(currentConfig, franchiseeId);
    if (success) {
      setIsEditing(false);
      toast({
        title: "Configuración guardada",
        description: "Las configuraciones de integración se han guardado correctamente",
      });
    }
  };

  const handleTestConnection = async (type: 'orquest' | 'biloop') => {
    setConnectionStatus(prev => ({ ...prev, [type]: 'testing' }));
    
    try {
      const success = await testConnection(type, franchiseeId);
      setConnectionStatus(prev => ({ 
        ...prev, 
        [type]: success ? 'success' : 'error' 
      }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [type]: 'error' }));
    }
  };

  const isOrquestConfigured = () => {
    return currentConfig.orquest.api_key && 
           currentConfig.orquest.base_url && 
           currentConfig.orquest.business_id;
  };

  const isBiloopConfigured = () => {
    return currentConfig.biloop.company_id;
  };

  const configStatus = getConfigStatus(configs[franchiseeId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuración de APIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuración de APIs
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={configStatus.variant}>
              {configStatus.label}
            </Badge>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveConfig}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuración Orquest */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">API Orquest</h3>
            <div className="flex items-center space-x-2">
              {isOrquestConfigured() && (
                <Badge variant={isOrquestConfigured() ? "default" : "secondary"}>
                  {isOrquestConfigured() ? "Configurado" : "Sin configurar"}
                </Badge>
              )}
              {connectionStatus.orquest && (
                <Badge variant={
                  connectionStatus.orquest === 'success' ? 'default' :
                  connectionStatus.orquest === 'error' ? 'destructive' : 'secondary'
                }>
                  {connectionStatus.orquest === 'testing' && 'Probando...'}
                  {connectionStatus.orquest === 'success' && <><Check className="w-3 h-3 mr-1" />Conectado</>}
                  {connectionStatus.orquest === 'error' && <><AlertCircle className="w-3 h-3 mr-1" />Error</>}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestConnection('orquest')}
                disabled={!isOrquestConfigured() || connectionStatus.orquest === 'testing'}
              >
                <TestTube2 className="w-4 h-4 mr-2" />
                Probar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orquest-api-key">API Key</Label>
              <Input
                id="orquest-api-key"
                type="password"
                value={currentConfig.orquest.api_key}
                onChange={(e) => setCurrentConfig(prev => ({
                  ...prev,
                  orquest: { ...prev.orquest, api_key: e.target.value }
                }))}
                disabled={!isEditing}
                placeholder="Introduce tu API Key de Orquest"
              />
            </div>
            <div>
              <Label htmlFor="orquest-base-url">URL Base</Label>
              <Input
                id="orquest-base-url"
                value={currentConfig.orquest.base_url}
                onChange={(e) => setCurrentConfig(prev => ({
                  ...prev,
                  orquest: { ...prev.orquest, base_url: e.target.value }
                }))}
                disabled={!isEditing}
                placeholder="https://pre-mc.orquest.es"
              />
            </div>
            <div>
              <Label htmlFor="orquest-business-id">Business ID</Label>
              <Input
                id="orquest-business-id"
                value={currentConfig.orquest.business_id}
                onChange={(e) => setCurrentConfig(prev => ({
                  ...prev,
                  orquest: { ...prev.orquest, business_id: e.target.value }
                }))}
                disabled={!isEditing}
                placeholder="MCDONALDS_ES"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Configuración Biloop */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">API Biloop</h3>
            <div className="flex items-center space-x-2">
              {isBiloopConfigured() && (
                <Badge variant={isBiloopConfigured() ? "default" : "secondary"}>
                  {isBiloopConfigured() ? "Configurado" : "Sin configurar"}
                </Badge>
              )}
              {connectionStatus.biloop && (
                <Badge variant={
                  connectionStatus.biloop === 'success' ? 'default' :
                  connectionStatus.biloop === 'error' ? 'destructive' : 'secondary'
                }>
                  {connectionStatus.biloop === 'testing' && 'Probando...'}
                  {connectionStatus.biloop === 'success' && <><Check className="w-3 h-3 mr-1" />Conectado</>}
                  {connectionStatus.biloop === 'error' && <><AlertCircle className="w-3 h-3 mr-1" />Error</>}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestConnection('biloop')}
                disabled={!isBiloopConfigured() || connectionStatus.biloop === 'testing'}
              >
                <TestTube2 className="w-4 h-4 mr-2" />
                Probar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="biloop-company-id">Company ID</Label>
              <Input
                id="biloop-company-id"
                value={currentConfig.biloop.company_id}
                onChange={(e) => setCurrentConfig(prev => ({
                  ...prev,
                  biloop: { ...prev.biloop, company_id: e.target.value }
                }))}
                disabled={!isEditing}
                placeholder="ID de empresa en Biloop"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
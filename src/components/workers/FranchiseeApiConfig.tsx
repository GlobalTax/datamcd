import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIntegrationConfig, IntegrationConfig } from '@/hooks/useIntegrationConfig';
import { useFranchiseeData } from '@/hooks/data/useFranchiseeData';
import { useToast } from '@/hooks/use-toast';
import { Building2, Database, Key, CheckCircle, XCircle, Settings, Wifi, AlertCircle } from 'lucide-react';

// Removed old interface - now using IntegrationConfig from hook

export const FranchiseeApiConfig: React.FC = () => {
  const [selectedFranchisee, setSelectedFranchisee] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<IntegrationConfig>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'testing' | 'success' | 'error'>>({});
  
  const { franchisees, isLoading: franchiseesLoading } = useFranchiseeData();
  const { toast } = useToast();
  const { 
    configs, 
    loading: configLoading, 
    saveConfig, 
    testConnection, 
    getConfigStatus 
  } = useIntegrationConfig();

  // Cargar configuración del franquiciado seleccionado
  useEffect(() => {
    if (selectedFranchisee && configs[selectedFranchisee]) {
      setCurrentConfig(configs[selectedFranchisee]);
    } else {
      setCurrentConfig({});
    }
  }, [selectedFranchisee, configs]);

  const handleSaveConfig = async () => {
    if (!selectedFranchisee) {
      toast({
        title: "Error",
        description: "Selecciona un franquiciado",
        variant: "destructive",
      });
      return;
    }

    const success = await saveConfig(currentConfig, selectedFranchisee);
    if (success) {
      setIsEditing(false);
    }
  };

  const isOrquestConfigured = (config: IntegrationConfig) => {
    return config.orquest?.api_key && config.orquest?.base_url && config.orquest?.business_id;
  };

  const isBiloopConfigured = (config: IntegrationConfig) => {
    return config.biloop?.company_id;
  };

  const handleTestConnection = async (type: 'orquest' | 'biloop') => {
    if (!selectedFranchisee) return;
    
    setConnectionStatus(prev => ({ ...prev, [`${selectedFranchisee}-${type}`]: 'testing' }));
    
    const success = await testConnection(type, selectedFranchisee);
    
    setConnectionStatus(prev => ({ 
      ...prev, 
      [`${selectedFranchisee}-${type}`]: success ? 'success' : 'error' 
    }));
  };

  if (franchiseesLoading || configLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de APIs por Franquiciado</CardTitle>
          <CardDescription>Cargando franquiciados...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de APIs por Franquiciado
          </CardTitle>
          <CardDescription>
            Configura las API keys de Orquest e Integraloop para cada franquiciado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de franquiciado */}
          <div className="space-y-2">
            <Label htmlFor="franchisee-select">Seleccionar Franquiciado</Label>
            <Select value={selectedFranchisee} onValueChange={setSelectedFranchisee}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un franquiciado" />
              </SelectTrigger>
              <SelectContent>
                {franchisees.map((franchisee) => {
                  const config = configs[franchisee.id] || {};
                  const status = getConfigStatus(config);
                  
                  return (
                    <SelectItem key={franchisee.id} value={franchisee.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{franchisee.franchisee_name}</span>
                        <Badge variant={status.variant} className="ml-2">
                          {status.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedFranchisee && (
            <>
              <Separator />
              
              {/* Estado actual */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Estado de configuración:</span>
                  <Badge variant={getConfigStatus(currentConfig).variant}>
                    {getConfigStatus(currentConfig).label}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>

              {/* Configuración de Orquest */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-4 w-4" />
                    Orquest API
                    {isOrquestConfigured(currentConfig) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {connectionStatus[`${selectedFranchisee}-orquest`] && (
                      <div className="ml-auto">
                        {connectionStatus[`${selectedFranchisee}-orquest`] === 'testing' && (
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                        )}
                        {connectionStatus[`${selectedFranchisee}-orquest`] === 'success' && (
                          <Wifi className="h-4 w-4 text-green-500" />
                        )}
                        {connectionStatus[`${selectedFranchisee}-orquest`] === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="orquest-api-key">API Key</Label>
                    <Input
                      id="orquest-api-key"
                      type="password"
                      placeholder="API Key de Orquest"
                      disabled={!isEditing}
                      value={currentConfig.orquest?.api_key || ''}
                      onChange={(e) => setCurrentConfig({
                        ...currentConfig,
                        orquest: { 
                          ...currentConfig.orquest, 
                          api_key: e.target.value, 
                          base_url: currentConfig.orquest?.base_url || 'https://pre-mc.orquest.es', 
                          business_id: currentConfig.orquest?.business_id || 'MCDONALDS_ES' 
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orquest-base-url">Base URL</Label>
                    <Input
                      id="orquest-base-url"
                      placeholder="https://pre-mc.orquest.es"
                      disabled={!isEditing}
                      value={currentConfig.orquest?.base_url || ''}
                      onChange={(e) => setCurrentConfig({
                        ...currentConfig,
                        orquest: { 
                          ...currentConfig.orquest, 
                          base_url: e.target.value, 
                          api_key: currentConfig.orquest?.api_key || '', 
                          business_id: currentConfig.orquest?.business_id || 'MCDONALDS_ES' 
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orquest-business-id">Business ID</Label>
                    <Input
                      id="orquest-business-id"
                      placeholder="MCDONALDS_ES"
                      disabled={!isEditing}
                      value={currentConfig.orquest?.business_id || ''}
                      onChange={(e) => setCurrentConfig({
                        ...currentConfig,
                        orquest: { 
                          ...currentConfig.orquest, 
                          business_id: e.target.value, 
                          api_key: currentConfig.orquest?.api_key || '', 
                          base_url: currentConfig.orquest?.base_url || 'https://pre-mc.orquest.es' 
                        }
                      })}
                    />
                  </div>
                  
                  {isOrquestConfigured(currentConfig) && !isEditing && (
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestConnection('orquest')}
                        disabled={connectionStatus[`${selectedFranchisee}-orquest`] === 'testing'}
                      >
                        <Wifi className="h-4 w-4 mr-2" />
                        Probar Conexión
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuración de Biloop */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-4 w-4" />
                    Biloop API
                    {isBiloopConfigured(currentConfig) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {connectionStatus[`${selectedFranchisee}-biloop`] && (
                      <div className="ml-auto">
                        {connectionStatus[`${selectedFranchisee}-biloop`] === 'testing' && (
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                        )}
                        {connectionStatus[`${selectedFranchisee}-biloop`] === 'success' && (
                          <Wifi className="h-4 w-4 text-green-500" />
                        )}
                        {connectionStatus[`${selectedFranchisee}-biloop`] === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="biloop-company-id">Company ID</Label>
                    <Input
                      id="biloop-company-id"
                      placeholder="Número de empresa en Biloop (ej: demo_company)"
                      disabled={!isEditing}
                      value={currentConfig.biloop?.company_id || ''}
                      onChange={(e) => setCurrentConfig({
                        ...currentConfig,
                        biloop: { 
                          ...currentConfig.biloop, 
                          company_id: e.target.value 
                        }
                      })}
                    />
                  </div>
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    <p><strong>Nota:</strong> Las credenciales API globales de Biloop se configuran a nivel de sistema.</p>
                    <p>Aquí solo necesitas especificar el número de empresa específico para este franquiciado.</p>
                  </div>
                  
                  {isBiloopConfigured(currentConfig) && !isEditing && (
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestConnection('biloop')}
                        disabled={connectionStatus[`${selectedFranchisee}-biloop`] === 'testing'}
                      >
                        <Wifi className="h-4 w-4 mr-2" />
                        Probar Conexión
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {isEditing && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveConfig}>
                    <Key className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Resumen global */}
      {Object.keys(configs).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Configuraciones</CardTitle>
            <CardDescription>Estado de las configuraciones de integración por franquiciado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {franchisees.map((franchisee) => {
                const config = configs[franchisee.id] || {};
                const status = getConfigStatus(config);
                
                return (
                  <div key={franchisee.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{franchisee.franchisee_name}</span>
                    <div className="flex items-center gap-2">
                      {isOrquestConfigured(config) && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600">Orquest</span>
                        </div>
                      )}
                      {isBiloopConfigured(config) && (
                        <div className="flex items-center gap-1">
                          <Database className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600">Biloop</span>
                        </div>
                      )}
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
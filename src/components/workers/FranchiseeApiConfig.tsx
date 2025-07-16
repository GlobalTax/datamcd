import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrquestConfig } from '@/hooks/useOrquestConfig';
import { useFranchisees } from '@/hooks/useFranchisees';
import { useToast } from '@/hooks/use-toast';
import { Building2, Database, Key, CheckCircle, XCircle, Settings } from 'lucide-react';

interface ApiConfig {
  orquest?: {
    apiKey: string;
    baseUrl: string;
    businessId: string;
  };
  biloop?: {
    subscriptionKey: string;
    token: string;
  };
}

export const FranchiseeApiConfig: React.FC = () => {
  const [selectedFranchisee, setSelectedFranchisee] = useState<string>('');
  const [configs, setConfigs] = useState<Record<string, ApiConfig>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ApiConfig>({});
  
  const { franchisees, loading: franchiseesLoading } = useFranchisees();
  const { toast } = useToast();

  // Cargar configuraciones guardadas del localStorage
  useEffect(() => {
    const savedConfigs = localStorage.getItem('franchisee-api-configs');
    if (savedConfigs) {
      try {
        setConfigs(JSON.parse(savedConfigs));
      } catch (error) {
        console.error('Error loading saved configs:', error);
      }
    }
  }, []);

  // Guardar configuraciones en localStorage
  const saveConfigs = (newConfigs: Record<string, ApiConfig>) => {
    localStorage.setItem('franchisee-api-configs', JSON.stringify(newConfigs));
    setConfigs(newConfigs);
  };

  // Cargar configuración del franquiciado seleccionado
  useEffect(() => {
    if (selectedFranchisee && configs[selectedFranchisee]) {
      setCurrentConfig(configs[selectedFranchisee]);
    } else {
      setCurrentConfig({});
    }
  }, [selectedFranchisee, configs]);

  const handleSaveConfig = () => {
    if (!selectedFranchisee) {
      toast({
        title: "Error",
        description: "Selecciona un franquiciado",
        variant: "destructive",
      });
      return;
    }

    const newConfigs = {
      ...configs,
      [selectedFranchisee]: currentConfig
    };

    saveConfigs(newConfigs);
    setIsEditing(false);
    
    toast({
      title: "Configuración guardada",
      description: "Las API keys se han guardado correctamente",
    });
  };

  const isOrquestConfigured = (config: ApiConfig) => {
    return config.orquest?.apiKey && config.orquest?.baseUrl && config.orquest?.businessId;
  };

  const isBiloopConfigured = (config: ApiConfig) => {
    return config.biloop?.subscriptionKey && config.biloop?.token;
  };

  const getConfigStatus = (config: ApiConfig) => {
    const orquestOk = isOrquestConfigured(config);
    const biloopOk = isBiloopConfigured(config);
    
    if (orquestOk && biloopOk) return { status: 'complete', label: 'Completa', variant: 'default' as const };
    if (orquestOk || biloopOk) return { status: 'partial', label: 'Parcial', variant: 'secondary' as const };
    return { status: 'none', label: 'Sin configurar', variant: 'destructive' as const };
  };

  if (franchiseesLoading) {
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
                      value={currentConfig.orquest?.apiKey || ''}
                      onChange={(e) => setCurrentConfig({
                        ...currentConfig,
                        orquest: { ...currentConfig.orquest, apiKey: e.target.value, baseUrl: currentConfig.orquest?.baseUrl || '', businessId: currentConfig.orquest?.businessId || '' }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orquest-base-url">Base URL</Label>
                    <Input
                      id="orquest-base-url"
                      placeholder="https://api.orquest.com"
                      disabled={!isEditing}
                      value={currentConfig.orquest?.baseUrl || ''}
                      onChange={(e) => setCurrentConfig({
                        ...currentConfig,
                        orquest: { ...currentConfig.orquest, baseUrl: e.target.value, apiKey: currentConfig.orquest?.apiKey || '', businessId: currentConfig.orquest?.businessId || '' }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orquest-business-id">Business ID</Label>
                    <Input
                      id="orquest-business-id"
                      placeholder="ID del negocio en Orquest"
                      disabled={!isEditing}
                      value={currentConfig.orquest?.businessId || ''}
                      onChange={(e) => setCurrentConfig({
                        ...currentConfig,
                        orquest: { ...currentConfig.orquest, businessId: e.target.value, apiKey: currentConfig.orquest?.apiKey || '', baseUrl: currentConfig.orquest?.baseUrl || '' }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configuración de Biloop */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-4 w-4" />
                    Integraloop API
                    {isBiloopConfigured(currentConfig) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="biloop-subscription-key">Subscription Key</Label>
                    <Input
                      id="biloop-subscription-key"
                      type="password"
                      placeholder="SUBSCRIPTION_KEY de Integraloop"
                      disabled={!isEditing}
                      value={currentConfig.biloop?.subscriptionKey || ''}
                      onChange={(e) => setCurrentConfig({
                        ...currentConfig,
                        biloop: { ...currentConfig.biloop, subscriptionKey: e.target.value, token: currentConfig.biloop?.token || '' }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biloop-token">Token</Label>
                    <Input
                      id="biloop-token"
                      type="password"
                      placeholder="Token de autenticación"
                      disabled={!isEditing}
                      value={currentConfig.biloop?.token || ''}
                      onChange={(e) => setCurrentConfig({
                        ...currentConfig,
                        biloop: { ...currentConfig.biloop, token: e.target.value, subscriptionKey: currentConfig.biloop?.subscriptionKey || '' }
                      })}
                    />
                  </div>
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
            <CardDescription>Estado de las API keys por franquiciado</CardDescription>
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
                      {isOrquestConfigured(config) && <Building2 className="h-4 w-4 text-green-500" />}
                      {isBiloopConfigured(config) && <Database className="h-4 w-4 text-green-500" />}
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

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecureConfig } from '@/hooks/useSecureConfig';
import { useFranchisees } from '@/hooks/useFranchisees';
import { useToast } from '@/hooks/use-toast';
import { Building2, Database, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const FranchiseeApiConfig: React.FC = () => {
  const [selectedFranchisee, setSelectedFranchisee] = useState<string>('');
  const { franchisees, loading: franchiseesLoading } = useFranchisees();
  const { toast } = useToast();

  // Use secure config hooks for each integration
  const orquestConfig = useSecureConfig('orquest', selectedFranchisee);
  const biloopConfig = useSecureConfig('biloop', selectedFranchisee);
  const quantumConfig = useSecureConfig('quantum', selectedFranchisee);

  const getConfigStatus = (isConfigured: boolean) => {
    if (isConfigured) return { status: 'complete', label: 'Configurado', variant: 'default' as const };
    return { status: 'none', label: 'Sin configurar', variant: 'destructive' as const };
  };

  const handleActivateIntegration = async (integrationType: 'orquest' | 'biloop' | 'quantum') => {
    let saveFunction;
    switch (integrationType) {
      case 'orquest':
        saveFunction = orquestConfig.saveConfig;
        break;
      case 'biloop':
        saveFunction = biloopConfig.saveConfig;
        break;
      case 'quantum':
        saveFunction = quantumConfig.saveConfig;
        break;
    }

    const success = await saveFunction({
      enabled: true,
      activated_at: new Date().toISOString()
    });

    if (success) {
      toast({
        title: "Integración activada",
        description: `La integración con ${integrationType} ha sido activada correctamente`,
      });
    }
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
            Configuración Segura de APIs por Franquiciado
          </CardTitle>
          <CardDescription>
            Las API keys se manejan de forma segura en el servidor. Solo necesitas activar las integraciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuración de Seguridad:</strong> Las claves de API ahora se almacenan de forma segura 
              en el servidor. No es necesario introducir claves manualmente.
            </AlertDescription>
          </Alert>

          {/* Selector de franquiciado */}
          <div className="space-y-2">
            <label htmlFor="franchisee-select">Seleccionar Franquiciado</label>
            <Select value={selectedFranchisee} onValueChange={setSelectedFranchisee}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un franquiciado" />
              </SelectTrigger>
              <SelectContent>
                {franchisees.map((franchisee) => (
                  <SelectItem key={franchisee.id} value={franchisee.id}>
                    {franchisee.franchisee_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFranchisee && (
            <>
              <Separator />

              {/* Configuración de Orquest */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-4 w-4" />
                    Orquest API
                    {orquestConfig.isConfigured ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant={getConfigStatus(orquestConfig.isConfigured).variant} className="ml-auto">
                      {getConfigStatus(orquestConfig.isConfigured).label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orquestConfig.config?.base_config && (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>URL Base:</strong> {orquestConfig.config.base_config.base_url}
                      </div>
                      <div className="text-sm">
                        <strong>Business ID:</strong> {orquestConfig.config.base_config.business_id}
                      </div>
                    </div>
                  )}
                  
                  {!orquestConfig.isConfigured && (
                    <Button 
                      onClick={() => handleActivateIntegration('orquest')}
                      disabled={orquestConfig.loading}
                      className="w-full"
                    >
                      {orquestConfig.loading ? 'Activando...' : 'Activar Integración Orquest'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Configuración de Biloop */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-4 w-4" />
                    Integraloop API
                    {biloopConfig.isConfigured ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant={getConfigStatus(biloopConfig.isConfigured).variant} className="ml-auto">
                      {getConfigStatus(biloopConfig.isConfigured).label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {biloopConfig.config?.base_config && (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>URL Base:</strong> {biloopConfig.config.base_config.base_url}
                      </div>
                    </div>
                  )}
                  
                  {!biloopConfig.isConfigured && (
                    <Button 
                      onClick={() => handleActivateIntegration('biloop')}
                      disabled={biloopConfig.loading}
                      className="w-full"
                    >
                      {biloopConfig.loading ? 'Activando...' : 'Activar Integración Biloop'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Configuración de Quantum */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-4 w-4" />
                    Quantum Economics API
                    {quantumConfig.isConfigured ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant={getConfigStatus(quantumConfig.isConfigured).variant} className="ml-auto">
                      {getConfigStatus(quantumConfig.isConfigured).label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quantumConfig.config?.base_config && (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>URL Base:</strong> {quantumConfig.config.base_config.base_url}
                      </div>
                    </div>
                  )}
                  
                  {!quantumConfig.isConfigured && (
                    <Button 
                      onClick={() => handleActivateIntegration('quantum')}
                      disabled={quantumConfig.loading}
                      className="w-full"
                    >
                      {quantumConfig.loading ? 'Activando...' : 'Activar Integración Quantum'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>

      {/* Resumen global */}
      {selectedFranchisee && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Integraciones</CardTitle>
            <CardDescription>Estado de las integraciones para el franquiciado seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="font-medium">Orquest</span>
                <div className="flex items-center gap-2">
                  {orquestConfig.isConfigured && <Building2 className="h-4 w-4 text-green-500" />}
                  <Badge variant={getConfigStatus(orquestConfig.isConfigured).variant}>
                    {getConfigStatus(orquestConfig.isConfigured).label}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="font-medium">Integraloop</span>
                <div className="flex items-center gap-2">
                  {biloopConfig.isConfigured && <Database className="h-4 w-4 text-green-500" />}
                  <Badge variant={getConfigStatus(biloopConfig.isConfigured).variant}>
                    {getConfigStatus(biloopConfig.isConfigured).label}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="font-medium">Quantum Economics</span>
                <div className="flex items-center gap-2">
                  {quantumConfig.isConfigured && <Database className="h-4 w-4 text-green-500" />}
                  <Badge variant={getConfigStatus(quantumConfig.isConfigured).variant}>
                    {getConfigStatus(quantumConfig.isConfigured).label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

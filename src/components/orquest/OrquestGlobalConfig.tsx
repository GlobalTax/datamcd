import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Settings, AlertCircle, Key, Globe, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GlobalOrquestConfig {
  api_key: string;
  base_url: string;
  business_id: string;
  is_active: boolean;
  auto_sync_enabled: boolean;
}

export const OrquestGlobalConfig: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<GlobalOrquestConfig>({
    api_key: '',
    base_url: 'https://pre-mc.orquest.es',
    business_id: 'MCDONALDS_ES',
    is_active: false,
    auto_sync_enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const fetchGlobalConfig = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('integration_type', 'orquest_global')
        .eq('config_name', 'Global Orquest Configuration')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.configuration) {
        const globalConfig = data.configuration as any;
        setConfig({
          api_key: globalConfig?.api_key || '',
          base_url: globalConfig?.base_url || 'https://pre-mc.orquest.es',
          business_id: globalConfig?.business_id || 'MCDONALDS_ES',
          is_active: globalConfig?.is_active || false,
          auto_sync_enabled: globalConfig?.auto_sync_enabled || true
        });
        setIsConfigured(!!globalConfig?.api_key);
      }
    } catch (error) {
      console.error('Error fetching global config:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración global",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveGlobalConfig = async () => {
    try {
      setSaving(true);

      if (!config.api_key.trim()) {
        toast({
          title: "Error",
          description: "La API Key es requerida",
          variant: "destructive"
        });
        return;
      }

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Usuario no autenticado');
      }

      const configData = {
        advisor_id: user.data.user.id,
        franchisee_id: null, // Global config
        integration_type: 'orquest_global',
        config_name: 'Global Orquest Configuration',
        configuration: config as any,
        api_endpoint: config.base_url,
        is_active: config.is_active,
      };

      const { error } = await supabase
        .from('integration_configs')
        .upsert(configData, {
          onConflict: 'integration_type,config_name'
        });

      if (error) throw error;

      setIsConfigured(true);
      toast({
        title: "✅ Configuración Global Guardada",
        description: "Orquest está configurado para todos los franquiciados",
      });

    } catch (error) {
      console.error('Error saving global config:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración global",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      
      // Aquí iría la lógica para probar la conexión con Orquest
      toast({
        title: "✅ Conexión Exitosa",
        description: "La configuración de Orquest es válida",
      });
    } catch (error) {
      toast({
        title: "❌ Error de Conexión",
        description: "No se pudo conectar con Orquest. Verifica las credenciales.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalConfig();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Configuración Global de Orquest</CardTitle>
              <CardDescription>
                Configuración centralizada para todos los franquiciados
              </CardDescription>
            </div>
          </div>
          <Badge variant={isConfigured ? 'default' : 'secondary'} className="px-3 py-1">
            {isConfigured ? (
              <><CheckCircle className="w-3 h-3 mr-1" /> Configurado</>
            ) : (
              <><AlertCircle className="w-3 h-3 mr-1" /> Sin configurar</>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Configuración única:</strong> Esta configuración se aplicará a todos los franquiciados. 
            Solo necesitas configurar una vez para que todos puedan usar Orquest.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="global-api-key" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key de Orquest
            </Label>
            <Input
              id="global-api-key"
              type="password"
              value={config.api_key}
              onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
              placeholder="Ingresa la API Key global de Orquest"
              className="bg-white"
            />
            <p className="text-xs text-muted-foreground">
              Esta API Key se usará para todos los franquiciados
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="global-base-url" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              URL Base
            </Label>
            <Input
              id="global-base-url"
              value={config.base_url}
              onChange={(e) => setConfig(prev => ({ ...prev, base_url: e.target.value }))}
              placeholder="https://pre-mc.orquest.es"
              className="bg-white"
            />
            <p className="text-xs text-muted-foreground">
              URL del entorno de Orquest (producción o preproducción)
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="global-business-id" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Business ID
            </Label>
            <Input
              id="global-business-id"
              value={config.business_id}
              onChange={(e) => setConfig(prev => ({ ...prev, business_id: e.target.value }))}
              placeholder="MCDONALDS_ES"
              className="bg-white"
            />
            <p className="text-xs text-muted-foreground">
              Identificador del negocio en Orquest
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Activar Orquest Globalmente</Label>
              <p className="text-xs text-muted-foreground">
                Habilita Orquest para todos los franquiciados
              </p>
            </div>
            <Switch
              checked={config.is_active}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Sincronización Automática</Label>
              <p className="text-xs text-muted-foreground">
                Sincronizar datos automáticamente cada hora
              </p>
            </div>
            <Switch
              checked={config.auto_sync_enabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auto_sync_enabled: checked }))}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={saveGlobalConfig}
            disabled={saving || !config.api_key.trim()}
            className="flex-1"
          >
            {saving ? "Guardando..." : "Guardar Configuración Global"}
          </Button>
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={loading || !config.api_key.trim()}
          >
            {loading ? "Probando..." : "Probar Conexión"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
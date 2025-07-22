import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Truck, 
  TestTube, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useSecureIntegration } from '@/hooks/useSecureIntegration';
import { useFranchisees } from '@/hooks/useFranchisees';

interface DeliveryApp {
  id: string;
  name: string;
  logo: string;
  enabled: boolean;
  credentials: {
    apiKey: string;
    merchantId: string;
    webhookUrl: string;
  };
}

export const DeliveryIntegrationConfig: React.FC = () => {
  const { franchisees } = useFranchisees();
  const currentFranchisee = franchisees?.[0];
  const { configs, loading, saveConfig } = useSecureIntegration('delivery', currentFranchisee?.id);

  const [deliveryApps, setDeliveryApps] = useState<DeliveryApp[]>([
    {
      id: 'ubereats',
      name: 'Uber Eats',
      logo: '🚗',
      enabled: false,
      credentials: { apiKey: '', merchantId: '', webhookUrl: '' }
    },
    {
      id: 'deliveroo',
      name: 'Deliveroo',
      logo: '🛵',
      enabled: false,
      credentials: { apiKey: '', merchantId: '', webhookUrl: '' }
    },
    {
      id: 'glovo',
      name: 'Glovo',
      logo: '📦',
      enabled: false,
      credentials: { apiKey: '', merchantId: '', webhookUrl: '' }
    },
    {
      id: 'justeat',
      name: 'Just Eat',
      logo: '🍕',
      enabled: false,
      credentials: { apiKey: '', merchantId: '', webhookUrl: '' }
    }
  ]);

  // Sincronizar con configuraciones del backend
  useEffect(() => {
    if (configs) {
      setDeliveryApps(prevApps => 
        prevApps.map(app => {
          const config = configs.find(c => c.provider_id === app.id);
          return config 
            ? { ...app, enabled: config.is_enabled }
            : app;
        })
      );
    }
  }, [configs]);

  const [testing, setTesting] = useState<string | null>(null);

  const handleToggleApp = (appId: string) => {
    setDeliveryApps(prev => 
      prev.map(app => 
        app.id === appId ? { ...app, enabled: !app.enabled } : app
      )
    );
  };

  const handleUpdateCredentials = (appId: string, field: string, value: string) => {
    setDeliveryApps(prev =>
      prev.map(app =>
        app.id === appId
          ? {
              ...app,
              credentials: { ...app.credentials, [field]: value }
            }
          : app
      )
    );
  };

  const handleSave = async () => {
    const enabledApps = deliveryApps.filter(app => app.enabled);
    
    if (enabledApps.length === 0) {
      toast.error('Habilita al menos una aplicación de delivery');
      return;
    }

    for (const app of enabledApps) {
      const success = await saveConfig({
        provider_id: app.id,
        provider_name: app.name,
        api_key: app.credentials.apiKey,
        merchant_id: app.credentials.merchantId,
        webhook_url: app.credentials.webhookUrl,
        is_enabled: app.enabled
      });
      
      if (!success) {
        return;
      }
    }
  };

  const handleTest = async (appId: string) => {
    setTesting(appId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Conexión con ${deliveryApps.find(app => app.id === appId)?.name} verificada`);
    } catch (error) {
      toast.error('Error al probar la conexión');
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-orange-600" />
            <div>
              <CardTitle>Aplicaciones de Delivery</CardTitle>
              <CardDescription>
                Conecta tus plataformas de entrega para consolidar pedidos y métricas
              </CardDescription>
            </div>
            <div className="ml-auto">
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Desconectado
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {deliveryApps.map((app) => (
              <Card key={app.id} className={`border-2 ${app.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{app.logo}</span>
                      <div>
                        <CardTitle className="text-lg">{app.name}</CardTitle>
                        <CardDescription>API de integración oficial</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={app.enabled}
                      onCheckedChange={() => handleToggleApp(app.id)}
                    />
                  </div>
                </CardHeader>
                
                {app.enabled && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${app.id}-api-key`}>API Key</Label>
                        <Input
                          id={`${app.id}-api-key`}
                          type="password"
                          placeholder="Tu API Key"
                          value={app.credentials.apiKey}
                          onChange={(e) => handleUpdateCredentials(app.id, 'apiKey', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${app.id}-merchant-id`}>Merchant ID</Label>
                        <Input
                          id={`${app.id}-merchant-id`}
                          placeholder="ID del comercio"
                          value={app.credentials.merchantId}
                          onChange={(e) => handleUpdateCredentials(app.id, 'merchantId', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${app.id}-webhook`}>Webhook URL</Label>
                      <Input
                        id={`${app.id}-webhook`}
                        placeholder="https://tu-dominio.com/webhook"
                        value={app.credentials.webhookUrl}
                        onChange={(e) => handleUpdateCredentials(app.id, 'webhookUrl', e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTest(app.id)}
                        disabled={testing === app.id}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        {testing === app.id ? 'Probando...' : 'Probar'}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
            
            <Button variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar Pedidos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Métricas de Delivery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">€1,234</div>
              <div className="text-sm text-muted-foreground">Ingresos Hoy</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">67</div>
              <div className="text-sm text-muted-foreground">Pedidos Completados</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">18.4€</div>
              <div className="text-sm text-muted-foreground">Ticket Promedio</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">92%</div>
              <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
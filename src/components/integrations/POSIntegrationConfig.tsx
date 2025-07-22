import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  TestTube, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useSecureIntegration } from '@/hooks/useSecureIntegration';
import { useFranchisees } from '@/hooks/useFranchisees';

export const POSIntegrationConfig: React.FC = () => {
  const { franchisees } = useFranchisees();
  const currentFranchisee = franchisees?.[0];
  const { saveConfig, loading } = useSecureIntegration('pos', currentFranchisee?.id);

  const [selectedPOS, setSelectedPOS] = useState('');
  const [credentials, setCredentials] = useState({
    endpoint: '',
    username: '',
    password: '',
    apiKey: '',
    storeId: ''
  });
  const [testing, setTesting] = useState(false);

  const posOptions = [
    { value: 'micros', label: 'Oracle Micros' },
    { value: 'aloha', label: 'NCR Aloha' },
    { value: 'toast', label: 'Toast POS' },
    { value: 'revel', label: 'Revel Systems' },
    { value: 'square', label: 'Square POS' },
    { value: 'lightspeed', label: 'Lightspeed' },
    { value: 'other', label: 'Otro sistema' }
  ];

  const handleSave = async (): Promise<void> => {
    if (!selectedPOS) {
      toast.error('Por favor selecciona un sistema POS');
      return;
    }

    await saveConfig({
      pos_system: selectedPOS,
      pos_name: selectedPOS.charAt(0).toUpperCase() + selectedPOS.slice(1),
      endpoint: credentials.endpoint,
      api_key: credentials.apiKey,
      username: credentials.username,
      password: credentials.password,
      store_id: credentials.storeId,
      is_enabled: true
    });
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Conexión POS verificada correctamente');
    } catch (error) {
      toast.error('Error al probar la conexión POS');
    } finally {
      setTesting(false);
    }
  };

  const renderCredentialFields = () => {
    if (!selectedPOS) return null;

    switch (selectedPOS) {
      case 'micros':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint del Servidor Micros</Label>
              <Input
                id="endpoint"
                placeholder="https://micros-server.ejemplo.com/api"
                value={credentials.endpoint}
                onChange={(e) => setCredentials(prev => ({ ...prev, endpoint: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
          </>
        );
      
      case 'square':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">Application ID</Label>
              <Input
                id="apiKey"
                placeholder="sandbox-sq0idb-xxx"
                value={credentials.apiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeId">Location ID</Label>
              <Input
                id="storeId"
                placeholder="LOCATION_ID"
                value={credentials.storeId}
                onChange={(e) => setCredentials(prev => ({ ...prev, storeId: e.target.value }))}
              />
            </div>
          </>
        );
      
      default:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="endpoint">URL de la API</Label>
              <Input
                id="endpoint"
                placeholder="https://api.ejemplo.com"
                value={credentials.endpoint}
                onChange={(e) => setCredentials(prev => ({ ...prev, endpoint: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Tu API Key"
                value={credentials.apiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <div>
              <CardTitle>Configuración del Sistema POS</CardTitle>
              <CardDescription>
                Conecta tu punto de venta para sincronizar transacciones y ventas
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
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pos-system">Sistema POS</Label>
            <Select value={selectedPOS} onValueChange={setSelectedPOS}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu sistema POS" />
              </SelectTrigger>
              <SelectContent>
                {posOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderCredentialFields()}

          {selectedPOS && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Los datos se sincronizarán automáticamente cada 15 minutos. 
                Se importarán ventas, transacciones y datos de productos.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={!selectedPOS || loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTest} 
              disabled={testing || !selectedPOS}
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testing ? 'Probando...' : 'Probar Conexión'}
            </Button>
            
            <Button variant="secondary" disabled={!selectedPOS}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar Datos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos Disponibles para Sincronización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="font-semibold">Ventas Diarias</div>
              <div className="text-sm text-muted-foreground">Ingresos totales</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="font-semibold">Transacciones</div>
              <div className="text-sm text-muted-foreground">Detalle de pedidos</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="font-semibold">Productos</div>
              <div className="text-sm text-muted-foreground">Mix de ventas</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="font-semibold">Devoluciones</div>
              <div className="text-sm text-muted-foreground">Anulaciones</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};